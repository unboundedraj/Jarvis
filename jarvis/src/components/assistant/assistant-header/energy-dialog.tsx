"use client";

import { type Dispatch, type SetStateAction } from "react";
import { type EnergyLevel } from "@/types/assistant";

type EnergyDialogProps = {
  isOpen: boolean;
  level: EnergyLevel;
  onClose: () => void;
  onLevelChange: Dispatch<SetStateAction<EnergyLevel>>;
  onSave: () => void;
};

export function EnergyDialog({
  isOpen,
  level,
  onClose,
  onLevelChange,
  onSave,
}: EnergyDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
            Energy Level
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
          Current energy level: {level}/10
        </label>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={level}
          onChange={(event) => onLevelChange(Number(event.target.value) as EnergyLevel)}
          className="mt-4 w-full accent-white"
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
            type="button"
            onClick={onSave}
            className="rounded-xl border border-brand bg-brand px-4 py-2 text-xs uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
