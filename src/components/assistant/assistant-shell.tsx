import { AiAssistSidebar } from "@/components/assistant/ai-assist-sidebar";
import { NoticeBoardPanel } from "@/components/assistant/notice-board-panel";
import { WorkspacePanel } from "@/components/assistant/workspace-panel";

export function AssistantShell() {
  return (
    <section className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,4fr)_minmax(0,1.1fr)] gap-2 sm:grid-rows-2 lg:grid-cols-[minmax(0,70%)_minmax(0,30%)] lg:grid-rows-1 lg:gap-3 lg:items-stretch">
      <div className="grid min-h-0 grid-rows-[minmax(0,4fr)_minmax(0,1.3fr)] gap-2 sm:grid-rows-[minmax(0,3.2fr)_minmax(0,2fr)] lg:gap-3">
        <WorkspacePanel />
        <NoticeBoardPanel />
      </div>
      <AiAssistSidebar />
    </section>
  );
}
