"use client";

import { type Task } from "@/types/task";

type TaskRowProps = {
  task: Task;
  onAddNote: (taskId: string) => void;
  onFocus: (taskId: string) => void;
  onComplete: (taskId: string) => void;
};

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

function formatExpectedTime(hours: Task["expectedTimeHours"]) {
  if (hours === 0.75) {
    return "45 mins";
  }

  if (hours === 1) {
    return "1 hr";
  }

  return `${hours} hrs`;
}

export function TaskRow({ task, onAddNote, onFocus, onComplete }: TaskRowProps) {
  return (
    <div className="rounded-xl border border-border bg-black/25 p-2 text-left sm:p-2.5">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:text-xs">
            {task.task}
          </h3>
          <p className="mt-0.5 text-[8px] uppercase tracking-[0.14em] text-text-soft sm:text-[9px]">
            {formatDeadline(task.deadline)} · {formatExpectedTime(task.expectedTimeHours)}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => onFocus(task.id)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-text-soft transition hover:border-white hover:text-white"
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
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-brand text-brand transition hover:bg-brand hover:text-brand-contrast"
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
            className="rounded-md border border-border px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-text-soft transition hover:border-white hover:text-white"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        {task.tags.length > 0 ? (
          task.tags.map((tag) => (
            <span
              key={`${task.id}-${tag}`}
              className="rounded-full border border-border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] text-text-soft"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-[8px] uppercase tracking-[0.12em] text-text-soft">
            No tags
          </span>
        )}
      </div>

      {task.notes.length > 0 && (
        <div className="mt-1.5 space-y-1 border-t border-border pt-1.5">
          {task.notes.map((item) => (
            <p key={item.id} className="text-[10px] leading-4 text-text-soft">
              <span className="mr-1 uppercase tracking-[0.12em] text-white">
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
