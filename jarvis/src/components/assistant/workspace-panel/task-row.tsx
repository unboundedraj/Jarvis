"use client";

import { type Task } from "@/types/task";

type TaskRowProps = {
  task: Task;
  onAddNote: (taskId: string) => void;
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

export function TaskRow({ task, onAddNote, onComplete }: TaskRowProps) {
  return (
    <div className="rounded-xl border border-border bg-black/25 p-3 text-left sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white sm:text-base">
            {task.task}
          </h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-text-soft sm:text-xs">
            {formatDeadline(task.deadline)} · {formatExpectedTime(task.expectedTimeHours)}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => onComplete(task.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand text-brand transition hover:bg-brand hover:text-brand-contrast"
            aria-label={`Mark ${task.task} as done`}
            title="Mark done"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onAddNote(task.id)}
            className="rounded-lg border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-soft transition hover:border-white hover:text-white"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {task.tags.length > 0 ? (
          task.tags.map((tag) => (
            <span
              key={`${task.id}-${tag}`}
              className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-text-soft"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-soft">
            No tags
          </span>
        )}
      </div>

      {task.notes.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {task.notes.map((item) => (
            <p key={item.id} className="text-xs leading-6 text-text-soft">
              <span className="mr-1 uppercase tracking-[0.18em] text-white">
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
