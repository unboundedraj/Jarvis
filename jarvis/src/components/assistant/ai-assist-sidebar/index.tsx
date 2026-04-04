import { orbitron } from "@/lib/fonts";

export function AiAssistSidebar() {
  return (
    <aside className="flex h-full min-h-0 flex-col items-center justify-start overflow-auto rounded-2xl border border-border bg-surface p-3 text-center sm:p-4">
      <h2
        className={`${orbitron.className} text-sm font-semibold uppercase tracking-widest text-brand sm:text-base`}
      >
        AI Assist
      </h2>
    </aside>
  );
}
