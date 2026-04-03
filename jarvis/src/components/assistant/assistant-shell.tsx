import { AiAssistSidebar } from "@/components/assistant/ai-assist-sidebar";
import { NoticeBoardPanel } from "@/components/assistant/notice-board-panel";
import { WorkspacePanel } from "@/components/assistant/workspace-panel";

export function AssistantShell() {
  return (
    <section className="grid h-full min-h-0 grid-cols-1 grid-rows-3 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-1 lg:gap-5 lg:items-stretch">
      <div className="grid min-h-0 grid-rows-[minmax(0,1.6fr)_minmax(0,1fr)] gap-4 lg:gap-5">
        <WorkspacePanel />
        <NoticeBoardPanel />
      </div>
      <AiAssistSidebar />
    </section>
  );
}
