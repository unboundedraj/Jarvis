"use client";

import { type FormEvent } from "react";

type TaskNoteDialogProps = {
  taskTitle: string;
  note: string;
  isOpen: boolean;
  onClose: () => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
};

export function TaskNoteDialog({
  taskTitle,
  note,
  isOpen,
  onClose,
  onNoteChange,
  onSubmit,
}: TaskNoteDialogProps) {
  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
            Add Note{taskTitle ? ` · ${taskTitle}` : ""}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.2em] text-text-soft transition hover:text-white"
          >
            Close
          </button>
        </div>
        <label className="block text-xs uppercase tracking-[0.18em] text-text-soft">
          Task note
        </label>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Write a note for this task"
          className="mt-2 min-h-32 w-full resize-none rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
        />
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
            Save Note
          </button>
        </div>
      </form>
    </div>
  );
}
