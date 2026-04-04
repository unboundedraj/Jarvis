import { cookies } from "next/headers";
import { AssistantAccessGate } from "@/components/assistant/access-gate";
import { AssistantHeader } from "@/components/assistant/assistant-header";
import { AssistantShell } from "@/components/assistant/assistant-shell";
import { ASSISTANT_ACCESS_COOKIE, hasAssistantAccess, isAssistantPinConfigured } from "@/lib/assistant-access";

export default async function AssistantPage() {
  const cookieStore = await cookies();
  const accessGranted = hasAssistantAccess(cookieStore.get(ASSISTANT_ACCESS_COOKIE)?.value);

  if (!accessGranted) {
    return (
      <main className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-6">
        <AssistantAccessGate pinConfigured={isAssistantPinConfigured()} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-7xl flex-col gap-2 overflow-hidden px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <AssistantHeader />
      <div className="min-h-0 flex-1">
        <AssistantShell />
      </div>
    </main>
  );
}
