import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ASSISTANT_ACCESS_COOKIE, hasAssistantAccess } from "@/lib/assistant-access";
import { getMongoDb } from "@/lib/mongodb";
import { type RepetitiveTask, type Task } from "@/types/task";

type WorkspacePayload = {
  tasks: Task[];
  repetitiveTasks?: RepetitiveTask[];
};

type WorkspaceDoc = {
  _id: string;
  tasks: Task[];
  repetitiveTasks: RepetitiveTask[];
  createdAt: string;
  updatedAt: string;
};

const COLLECTION = "assistant_workspace";
const DOC_ID = "primary";

export async function GET() {
  try {
    const cookieStore = await cookies();

    if (!hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const db = await getMongoDb();
    const collection = db.collection<WorkspaceDoc>(COLLECTION);
    const doc = await collection.findOne({ _id: DOC_ID });

    return NextResponse.json({
      tasks: Array.isArray(doc?.tasks) ? doc.tasks : [],
      repetitiveTasks: Array.isArray(doc?.repetitiveTasks) ? doc.repetitiveTasks : [],
    });
  } catch {
    return NextResponse.json({ message: "Failed to fetch workspace state." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    if (!hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = (await request.json()) as WorkspacePayload;

    if (!Array.isArray(payload.tasks)) {
      return NextResponse.json({ message: "Invalid tasks payload." }, { status: 400 });
    }

    if (payload.repetitiveTasks !== undefined && !Array.isArray(payload.repetitiveTasks)) {
      return NextResponse.json({ message: "Invalid repetitive tasks payload." }, { status: 400 });
    }

    const db = await getMongoDb();
    const collection = db.collection<WorkspaceDoc>(COLLECTION);

    const nextSet: {
      tasks: Task[];
      repetitiveTasks?: RepetitiveTask[];
      updatedAt: string;
    } = {
      tasks: payload.tasks,
      updatedAt: new Date().toISOString(),
    };

    if (payload.repetitiveTasks !== undefined) {
      nextSet.repetitiveTasks = payload.repetitiveTasks;
    }

    await collection.updateOne(
      { _id: DOC_ID },
      {
        $set: nextSet,
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to sync workspace state." }, { status: 500 });
  }
}
