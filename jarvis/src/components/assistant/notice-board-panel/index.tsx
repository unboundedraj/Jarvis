"use client";

import { useEffect, useState } from "react";
import { orbitron } from "@/lib/fonts";
import { type StickyNote } from "@/types/notice-board";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function NoticeBoardPanel() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draftNote, setDraftNote] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  useEffect(() => {
    const fetchNoticeBoardState = async () => {
      try {
        const response = await fetch("/api/sync/notice-board", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { notes?: StickyNote[] };
        if (Array.isArray(data.notes)) {
          setNotes(data.notes);
        }
      } catch {
        // Keep local notes available if API fetch fails.
      }
    };

    void fetchNoticeBoardState();
  }, []);

  const addStickyNote = () => {
    const trimmedNote = draftNote.trim();
    if (!trimmedNote) {
      return;
    }

    const nextNote: StickyNote = {
      id: createId(),
      text: trimmedNote,
      createdAt: new Date().toISOString(),
    };

    setNotes((currentNotes) => [nextNote, ...currentNotes]);
    setDraftNote("");
    setIsAddOpen(false);
  };

  const deleteStickyNote = (noteId: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
  };

  const syncNoticeBoard = async () => {
    setSyncStatus("syncing");

    try {
      const response = await fetch("/api/sync/notice-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-3 text-center sm:p-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2
          className={`${orbitron.className} text-sm font-semibold uppercase tracking-widest text-brand sm:text-base`}
        >
          Notice Board
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-soft transition hover:border-white hover:text-white"
            aria-label="Pin a sticky note"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 3h6" />
              <path d="M8 3v4l-3 4v2h14v-2l-3-4V3" />
              <path d="M12 13v8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={syncNoticeBoard}
            className="rounded-lg border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-soft transition hover:border-white hover:text-white"
          >
            Sync
          </button>
        </div>
      </div>

      <p className="shrink-0 text-right text-[10px] uppercase tracking-[0.18em] text-text-soft">
        {syncStatus === "syncing" && "Syncing..."}
        {syncStatus === "synced" && "Synced"}
        {syncStatus === "error" && "Sync failed"}
        {syncStatus === "idle" && ""}
      </p>

      <div className="min-h-0 flex-1 overflow-auto pr-1">
        {notes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="relative aspect-square flex flex-col gap-2 rounded-xl border border-border bg-black/25 p-3 transition hover:bg-black/35"
              >
                <p className="flex-1 text-xs leading-4 text-white overflow-auto line-clamp-6">
                  {note.text}
                </p>
                <button
                  type="button"
                  onClick={() => deleteStickyNote(note.id)}
                  className="w-full rounded-lg border border-border px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-text-soft transition hover:border-red-500 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border p-4 text-center text-xs uppercase tracking-[0.18em] text-text-soft">
            No pinned notes yet.
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
                Pin Sticky Note
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-xs uppercase tracking-[0.2em] text-text-soft transition hover:text-white"
              >
                Close
              </button>
            </div>

            <textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder="Write your sticky note"
              className="min-h-32 w-full resize-none rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-soft transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addStickyNote}
                className="rounded-xl border border-brand bg-brand px-4 py-2 text-xs uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90"
              >
                Pin
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
