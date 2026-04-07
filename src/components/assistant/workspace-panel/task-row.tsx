"use client";

import { cn } from "@/lib/cn";
import { type RepetitiveTask, type WorkspaceTask } from "@/types/task";

type TaskRowProps = {
  task: WorkspaceTask;
  onAddNote: (taskId: string) => void;
  onFocus: (taskId: string) => void;
  onComplete: (taskId: string) => void;
};

function isRepetitiveTask(task: WorkspaceTask): task is RepetitiveTask {
  return "frequency" in task;
}

function formatDeadline(deadline?: string) {
  if (!deadline) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(deadline));
}

function formatExpectedTime(hours: WorkspaceTask["expectedTimeHours"]) {
  if (hours === 0.75) {
    return "45 mins";
  }

  if (hours === 1) {
    return "1 hr";
  }

  return `${hours} hrs`;
}

export function TaskRow({ task, onAddNote, onFocus, onComplete }: TaskRowProps) {
  const repetitive = isRepetitiveTask(task);

  return (
    <div
      className={cn(
        "rounded-xl border p-2 text-left sm:p-2.5",
        repetitive ? "border-black/15 bg-white text-black" : "border-border bg-black/25",
      )}
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs", repetitive ? "text-black" : "text-white")}>
            {task.task}
          </h3>
          <p
            className={cn(
              "mt-0.5 text-[8px] uppercase tracking-[0.14em] sm:text-[9px]",
              repetitive ? "text-black/70" : "text-text-soft",
            )}
          >
            {formatDeadline(task.deadline)} · {formatExpectedTime(task.expectedTimeHours)}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => onFocus(task.id)}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-md border transition",
              repetitive
                ? "border-black/25 text-black/70 hover:border-black hover:text-black"
                : "border-border text-text-soft hover:border-white hover:text-white",
            )}
            aria-label={`Start focus mode for ${task.task}`}
            title="Focus mode"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="2.2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onComplete(task.id)}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-md border transition",
              repetitive
                ? "border-black text-black hover:bg-black hover:text-white"
                : "border-brand text-brand hover:bg-brand hover:text-brand-contrast",
            )}
            aria-label={`Mark ${task.task} as done`}
            title="Mark done"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onAddNote(task.id)}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] transition",
              repetitive
                ? "border-black/25 text-black/70 hover:border-black hover:text-black"
                : "border-border text-text-soft hover:border-white hover:text-white",
            )}
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        {repetitive ? (
          <span className="rounded-full border border-black/20 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] text-black/70">
            Habit
          </span>
        ) : null}
        {task.tags.length > 0 ? (
          task.tags.map((tag) => (
            <span
              key={`${task.id}-${tag}`}
              className={cn(
                "rounded-full border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em]",
                repetitive ? "border-black/20 text-black/70" : "border-border text-text-soft",
              )}
            >
              {tag}
            </span>
          ))
        ) : (
          <span className={cn("text-[8px] uppercase tracking-[0.12em]", repetitive ? "text-black/70" : "text-text-soft")}>
            No tags
          </span>
        )}
      </div>

      {task.notes.length > 0 && (
        <div className={cn("mt-1.5 space-y-1 border-t pt-1.5", repetitive ? "border-black/15" : "border-border")}>
          {task.notes.map((item) => (
            <p key={item.id} className={cn("text-[10px] leading-4", repetitive ? "text-black/75" : "text-text-soft")}>
              <span className={cn("mr-1 uppercase tracking-[0.12em]", repetitive ? "text-black" : "text-white")}>
                Note:
              </span>
              {item.note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
