import { NextResponse } from "next/server";
import { ASSISTANT_ACCESS_COOKIE, getAssistantAccessToken, getAssistantPin, isAssistantPinConfigured } from "@/lib/assistant-access";

type PinPayload = {
  pin: string;
};

export async function POST(request: Request) {
  try {
    if (!isAssistantPinConfigured()) {
      return NextResponse.json({ message: "Access PIN is not configured." }, { status: 500 });
    }

    const payload = (await request.json()) as PinPayload;
    const expectedPin = getAssistantPin();
    const providedPin = typeof payload.pin === "string" ? payload.pin.trim() : "";

    if (!providedPin || providedPin !== expectedPin) {
      return NextResponse.json({ message: "Invalid PIN." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: ASSISTANT_ACCESS_COOKIE,
      value: getAssistantAccessToken(expectedPin),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Failed to verify PIN." }, { status: 500 });
  }
}