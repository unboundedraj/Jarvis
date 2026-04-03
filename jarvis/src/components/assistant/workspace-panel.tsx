import { orbitron } from "@/lib/fonts";

export function WorkspacePanel() {
  return (
    <section className="flex h-full min-h-0 flex-col items-center justify-start overflow-auto rounded-2xl border border-border bg-surface p-5 text-center sm:p-6">
      <h2
        className={`${orbitron.className} text-base font-semibold uppercase tracking-widest text-brand sm:text-lg`}
      >
        Workspace
      </h2>
    </section>
  );
}
