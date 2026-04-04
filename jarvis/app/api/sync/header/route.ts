import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ASSISTANT_ACCESS_COOKIE, hasAssistantAccess } from "@/lib/assistant-access";
import { getMongoDb } from "@/lib/mongodb";

type HeaderPayload = {
  about: string;
};

const COLLECTION = "assistant_header";
const DOC_ID = "primary";

export async function GET() {
  try {
    const cookieStore = await cookies();

    if (!hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const db = await getMongoDb();
    const doc = await db.collection(COLLECTION).findOne<{ about: string }>({ _id: DOC_ID });

    return NextResponse.json({
      about: doc?.about ?? "",
    });
  } catch {
    return NextResponse.json({ message: "Failed to fetch header state." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    if (!hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = (await request.json()) as HeaderPayload;

    if (typeof payload.about !== "string") {
      return NextResponse.json({ message: "Invalid about value." }, { status: 400 });
    }

    const db = await getMongoDb();
    await db.collection(COLLECTION).updateOne(
      { _id: DOC_ID },
      {
        $set: {
          about: payload.about.trim(),
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
    return NextResponse.json({ message: "Failed to sync header state." }, { status: 500 });
  }
}
