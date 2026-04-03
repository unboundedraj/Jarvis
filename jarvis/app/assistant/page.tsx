import { AssistantShell } from "@/components/assistant/assistant-shell";
import { APP_NAME } from "@/constants/branding";
import { orbitron } from "@/lib/fonts";

export default function AssistantPage() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-7xl flex-col gap-4 overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <header className="shrink-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h1
          className={`${orbitron.className} text-center text-xl font-bold uppercase tracking-widest text-brand sm:text-2xl`}
        >
          {APP_NAME}
        </h1>
      </header>
      <div className="min-h-0 flex-1">
        <AssistantShell />
      </div>
    </main>
  );
}
