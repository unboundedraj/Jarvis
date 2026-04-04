"use client";

import { type FormEvent } from "react";
import { type Task, type TaskDraft } from "@/types/task";

const EXPECTED_TIME_OPTIONS: Array<{ value: Task["expectedTimeHours"]; label: string }> = [
  { value: 0.5, label: "0.5 hrs" },
  { value: 0.75, label: "45 mins" },
  { value: 1, label: "1 hr" },
  { value: 1.5, label: "1.5 hrs" },
  { value: 2, label: "2 hrs" },
  { value: 3, label: "3 hrs" },
  { value: 4, label: "4 hrs" },
  { value: 5, label: "5 hrs" },
  { value: 6, label: "6 hrs" },
  { value: 7, label: "7 hrs" },
];

type TaskDialogProps = {
  draft: TaskDraft;
  isOpen: boolean;
  onClose: () => void;
  onDraftChange: (nextDraft: TaskDraft) => void;
  onSubmit: () => void;
};

export function TaskDialog({
  draft,
  isOpen,
  onClose,
  onDraftChange,
  onSubmit,
}: TaskDialogProps) {
  if (!isOpen) {
    return null;
  }

  const updateDraft = (field: keyof TaskDraft, value: string) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
            Create Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.2em] text-text-soft transition hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">
              Task
            </span>
            <input
              value={draft.task}
              onChange={(event) => updateDraft("task", event.target.value)}
              placeholder="What needs to be done?"
              className="mt-2 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">
              Deadline (optional)
            </span>
            <input
              type="date"
              value={draft.deadline}
              onChange={(event) => updateDraft("deadline", event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-brand"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">
              Expected time
            </span>
            <select
              value={draft.expectedTimeHours}
              onChange={(event) =>
                onDraftChange({
                  ...draft,
                  expectedTimeHours: Number(event.target.value) as Task["expectedTimeHours"],
                })
              }
              className="mt-2 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-brand"
            >
              {EXPECTED_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">
              Tags
            </span>
            <input
              value={draft.tagsText}
              onChange={(event) => updateDraft("tagsText", event.target.value)}
              placeholder="Comma separated tags"
              className="mt-2 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">
              Note while creating (optional)
            </span>
            <textarea
              value={draft.note}
              onChange={(event) => updateDraft("note", event.target.value)}
              placeholder="Add a note for this task"
              className="mt-2 min-h-28 w-full resize-none rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-soft transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl border border-brand bg-brand px-4 py-2 text-xs uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}
