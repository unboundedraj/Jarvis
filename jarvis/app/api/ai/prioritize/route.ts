import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ASSISTANT_ACCESS_COOKIE, hasAssistantAccess } from "@/lib/assistant-access";
import { type EnergyLevel } from "@/types/assistant";
import { type Task } from "@/types/task";

type PrioritizePayload = {
  about: string;
  energyLevel: EnergyLevel;
  remarks?: string;
  tasks: Task[];
};

type GroqDecision = {
  orderedTaskIds: string[];
  recommendedTaskId: string;
  rationale: string;
};

function normalizeDecision(decision: GroqDecision, tasks: Task[]) {
  const taskIds = new Set(tasks.map((task) => task.id));
  const uniqueOrderedTaskIds: string[] = [];

  for (const taskId of decision.orderedTaskIds) {
    if (taskIds.has(taskId) && !uniqueOrderedTaskIds.includes(taskId)) {
      uniqueOrderedTaskIds.push(taskId);
    }
  }

  for (const task of tasks) {
    if (!uniqueOrderedTaskIds.includes(task.id)) {
      uniqueOrderedTaskIds.push(task.id);
    }
  }

  const recommendedTaskId =
    taskIds.has(decision.recommendedTaskId) && uniqueOrderedTaskIds.includes(decision.recommendedTaskId)
      ? decision.recommendedTaskId
      : uniqueOrderedTaskIds[0] ?? "";

  return {
    orderedTaskIds: uniqueOrderedTaskIds,
    recommendedTaskId,
    rationale: decision.rationale?.trim() || "Recommended by Groq based on your current context.",
  };
}

function safeParseDecision(raw: string): GroqDecision | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Partial<GroqDecision>;

    if (!Array.isArray(parsed.orderedTaskIds) || typeof parsed.recommendedTaskId !== "string") {
      return null;
    }

    return {
      orderedTaskIds: parsed.orderedTaskIds.filter((item): item is string => typeof item === "string"),
      recommendedTaskId: parsed.recommendedTaskId,
      rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    if (!hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = (await request.json()) as PrioritizePayload;

    if (
      typeof payload.about !== "string" ||
      typeof payload.energyLevel !== "number" ||
      !Number.isInteger(payload.energyLevel) ||
      payload.energyLevel < 0 ||
      payload.energyLevel > 10 ||
      !Array.isArray(payload.tasks)
    ) {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    if (payload.tasks.length === 0) {
      return NextResponse.json({ message: "No tasks available to prioritize." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({ message: "Missing GROQ_API_KEY server environment variable." }, { status: 500 });
    }

    const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

    const promptPayload = {
      profileAbout: payload.about,
      energyLevel: payload.energyLevel,
      userRemarks: payload.remarks?.trim() || "",
      tasks: payload.tasks.map((task) => ({
        id: task.id,
        task: task.task,
        deadline: task.deadline ?? null,
        expectedTimeHours: task.expectedTimeHours,
        tags: task.tags,
        notes: task.notes.map((note) => note.note),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    };

    const systemMessage = [
      "You are a task-prioritization assistant.",
      "Prioritize ethically: do not elevate harmful, deceptive, abusive, or unsafe actions.",
      "Consider user energy level and urgency.",
      "Respond with strict JSON only and no markdown.",
      "Required shape:",
      '{"orderedTaskIds":["id1","id2"],"recommendedTaskId":"id1","rationale":"short explanation"}',
      "orderedTaskIds must include all provided task IDs exactly once.",
    ].join("\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: JSON.stringify(promptPayload),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
          { message: "Groq request failed.", details: errorText.slice(0, 400) },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const rawContent = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!rawContent) {
      return NextResponse.json({ message: "Groq returned an empty response." }, { status: 502 });
    }

    const parsedDecision = safeParseDecision(rawContent);

    if (!parsedDecision) {
      return NextResponse.json(
        { message: "Unable to parse Groq response.", rawResponse: rawContent.slice(0, 700) },
        { status: 502 },
      );
    }

    const normalized = normalizeDecision(parsedDecision, payload.tasks);

    return NextResponse.json({
      provider: "groq",
      model,
      orderedTaskIds: normalized.orderedTaskIds,
      recommendedTaskId: normalized.recommendedTaskId,
      rationale: normalized.rationale,
    });
  } catch {
    return NextResponse.json({ message: "Failed to prioritize tasks." }, { status: 500 });
  }
}
