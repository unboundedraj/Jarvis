import { createHash, timingSafeEqual } from "node:crypto";

export const ASSISTANT_ACCESS_COOKIE = "jarvis_access_token";

export function getAssistantPin() {
  return process.env.JARVIS_ACCESS_PIN?.trim() ?? "";
}

export function isAssistantPinConfigured() {
  return getAssistantPin().length > 0;
}

export function getAssistantAccessToken(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

export function hasAssistantAccess(cookieValue?: string | null) {
  const pin = getAssistantPin();

  if (!pin || !cookieValue) {
    return false;
  }

  const expected = Buffer.from(getAssistantAccessToken(pin), "utf8");
  const actual = Buffer.from(cookieValue, "utf8");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}