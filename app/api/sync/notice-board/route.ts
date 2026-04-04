import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ASSISTANT_ACCESS_COOKIE, hasAssistantAccess } from "@/lib/assistant-access";
import { getMongoDb } from "@/lib/mongodb";
import { type StickyNote } from "@/types/notice-board";

type NoticeBoardPayload = {
  notes: StickyNote[];
};

type NoticeBoardDoc = {
  _id: string;
  notes: StickyNote[];
  createdAt: string;
  updatedAt: string;
};

const COLLECTION = "assistant_notice_board";
const DOC_ID = "primary";

export async function GET() {
  try {
    const cookieStore = await cookies();

    if (!hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const db = await getMongoDb();
    const collection = db.collection<NoticeBoardDoc>(COLLECTION);
    const doc = await collection.findOne({ _id: DOC_ID });

    return NextResponse.json({
      notes: Array.isArray(doc?.notes) ? doc.notes : [],
    });
  } catch {
    return NextResponse.json({ message: "Failed to fetch notice board state." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    if (!hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = (await request.json()) as NoticeBoardPayload;

    if (!Array.isArray(payload.notes)) {
      return NextResponse.json({ message: "Invalid notes payload." }, { status: 400 });
    }

    const db = await getMongoDb();
    const collection = db.collection<NoticeBoardDoc>(COLLECTION);
    await collection.updateOne(
      { _id: DOC_ID },
      {
        $set: {
          notes: payload.notes,
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to sync notice board state." }, { status: 500 });
  }
}
