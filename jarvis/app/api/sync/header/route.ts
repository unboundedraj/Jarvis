import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ASSISTANT_ACCESS_COOKIE, hasAssistantAccess } from "@/lib/assistant-access";
import { getMongoDb } from "@/lib/mongodb";
import { type EnergyLevel } from "@/types/assistant";

type HeaderPayload = {
  about: string;
  energyLevel: EnergyLevel;
};

type HeaderDoc = {
  _id: string;
  about: string;
  energyLevel: EnergyLevel;
  createdAt: string;
  updatedAt: string;
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
    const collection = db.collection<HeaderDoc>(COLLECTION);
    const doc = await collection.findOne({ _id: DOC_ID });

    return NextResponse.json({
      about: doc?.about ?? "",
      energyLevel: doc?.energyLevel ?? 5,
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

    if (
      typeof payload.energyLevel !== "number" ||
      !Number.isInteger(payload.energyLevel) ||
      payload.energyLevel < 0 ||
      payload.energyLevel > 10
    ) {
      return NextResponse.json({ message: "Invalid energy level." }, { status: 400 });
    }

    const db = await getMongoDb();
    const collection = db.collection<HeaderDoc>(COLLECTION);
    await collection.updateOne(
      { _id: DOC_ID },
      {
        $set: {
          about: payload.about.trim(),
          energyLevel: payload.energyLevel,
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
