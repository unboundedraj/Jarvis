"use client";

import { useState } from "react";
import { orbitron } from "@/lib/fonts";
import { type EnergyLevel } from "@/types/assistant";
import { type Task } from "@/types/task";

const WORKSPACE_TASKS_REPLACED_EVENT = "workspace:tasks-replaced";

type HeaderStateResponse = {
  about?: string;
  energyLevel?: EnergyLevel;
};

type WorkspaceStateResponse = {
  tasks?: Task[];
};

type PrioritizeResponse = {
  provider: "groq";
  model: string;
  orderedTaskIds: string[];
  recommendedTaskId: string;
  rationale: string;
};

function sortTasksByOrderedIds(tasks: Task[], orderedTaskIds: string[]) {
  const indexById = new Map(orderedTaskIds.map((taskId, index) => [taskId, index]));

  return [...tasks].sort((a, b) => {
    const aIndex = indexById.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = indexById.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

export function AiAssistSidebar() {
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [recommendation, setRecommendation] = useState<{ taskName: string; rationale: string } | null>(null);

  const askGroqToPrioritize = async () => {
    setStatus("loading");
    setStatusMessage("Analyzing your context...");

    try {
      const [headerResponse, workspaceResponse] = await Promise.all([
        fetch("/api/sync/header", { cache: "no-store" }),
        fetch("/api/sync/workspace", { cache: "no-store" }),
      ]);

      if (!headerResponse.ok || !workspaceResponse.ok) {
        throw new Error("Unable to fetch context from header/workspace.");
      }

      const headerData = (await headerResponse.json()) as HeaderStateResponse;
      const workspaceData = (await workspaceResponse.json()) as WorkspaceStateResponse;
      const tasks = Array.isArray(workspaceData.tasks) ? workspaceData.tasks : [];

      if (tasks.length === 0) {
        throw new Error("Add at least one task in workspace before asking AI Assist.");
      }

      const prioritizeResponse = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about: headerData.about ?? "",
          energyLevel: headerData.energyLevel ?? 5,
          remarks: remarks.trim(),
          tasks,
        }),
      });

      if (!prioritizeResponse.ok) {
        const errorPayload = (await prioritizeResponse.json().catch(() => null)) as
          | { message?: string; details?: string; rawResponse?: string }
          | null;
        throw new Error(
          errorPayload?.details ??
            errorPayload?.message ??
            errorPayload?.rawResponse ??
            "Failed to get recommendation from Groq.",
        );
      }

      const prioritizeData = (await prioritizeResponse.json()) as PrioritizeResponse;
      const sortedTasks = sortTasksByOrderedIds(tasks, prioritizeData.orderedTaskIds);

      const syncResponse = await fetch("/api/sync/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: sortedTasks }),
      });

      if (!syncResponse.ok) {
        throw new Error("Prioritization worked, but failed to save new task order.");
      }

      const recommendedTask = sortedTasks.find((task) => task.id === prioritizeData.recommendedTaskId) ?? sortedTasks[0];

      setRecommendation({
        taskName: recommendedTask?.task ?? "No task selected",
        rationale: prioritizeData.rationale,
      });

      window.dispatchEvent(
        new CustomEvent<{ tasks: Task[] }>(WORKSPACE_TASKS_REPLACED_EVENT, {
          detail: { tasks: sortedTasks },
        }),
      );

      setStatus("success");
      setStatusMessage(`Sorted ${sortedTasks.length} tasks with Groq.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to prioritize tasks.";
      setStatus("error");
      setStatusMessage(message);
      setRecommendation(null);
    }
  };

  return (
    <aside className="flex h-full min-h-0 flex-col items-center justify-start overflow-auto rounded-2xl border border-border bg-surface p-3 text-center sm:p-4">
      <h2
        className={`${orbitron.className} text-sm font-semibold uppercase tracking-widest text-brand sm:text-base`}
      >
        AI Assist
      </h2>

      <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-text-soft">
        Provider: Groq
      </p>

      <label className="mt-3 block w-full text-left">
        <span className="block text-[10px] uppercase tracking-[0.16em] text-text-soft">
          Optional Remarks For AI
        </span>
        <textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Any context to help with prioritization?"
          className="mt-1.5 min-h-24 w-full resize-none rounded-xl border border-border bg-black/40 px-3 py-2 text-xs text-white outline-none transition placeholder:text-text-soft focus:border-brand"
        />
      </label>

      <button
        type="button"
        onClick={askGroqToPrioritize}
        disabled={status === "loading"}
        className="ai-prioritize-orb mt-4 inline-flex h-36 w-36 items-center justify-center rounded-full border text-center text-[10px] uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-60 sm:h-40 sm:w-40"
      >
        {status === "loading" ? "Analyzing..." : "Prioritize\nWorkspace"}
      </button>

      <p className="mt-2 min-h-4 text-[10px] uppercase tracking-[0.14em] text-text-soft">
        {statusMessage}
      </p>

      {recommendation ? (
        <div className="mt-3 w-full rounded-xl border border-border bg-black/25 p-3 text-left">
          <p className="text-[9px] uppercase tracking-[0.18em] text-text-soft">Start with</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            {recommendation.taskName}
          </p>
          <p className="mt-2 text-[11px] leading-4 text-text-soft">{recommendation.rationale}</p>
        </div>
      ) : null}
    </aside>
  );
}
