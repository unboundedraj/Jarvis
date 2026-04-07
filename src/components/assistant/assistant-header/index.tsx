"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/constants/branding";
import { useFocusMode } from "@/components/assistant/focus-mode/provider";
import { orbitron } from "@/lib/fonts";
import { type AssistantProfile, type EnergyLevel } from "@/types/assistant";
import { EnergyDialog } from "./energy-dialog";
import { ProfileDialog } from "./profile-dialog";

const INITIAL_PROFILE: AssistantProfile = {
  about: "",
};

function formatSystemTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSystemDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
}

export function AssistantHeader() {
  const { startFocusMode } = useFocusMode();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnergyOpen, setIsEnergyOpen] = useState(false);
  const [isCustomFocusOpen, setIsCustomFocusOpen] = useState(false);
  const [profile, setProfile] = useState<AssistantProfile>(INITIAL_PROFILE);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(5);
  const [draftAbout, setDraftAbout] = useState(profile.about);
  const [focusTaskName, setFocusTaskName] = useState("");
  const [focusDeadline, setFocusDeadline] = useState("");
  const [focusExpectedTime, setFocusExpectedTime] = useState("");
  const [focusTags, setFocusTags] = useState("");
  const [focusNotes, setFocusNotes] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [systemDateTime, setSystemDateTime] = useState<{ time: string; date: string } | null>(null);

  useEffect(() => {
    const fetchHeaderState = async () => {
      try {
        const response = await fetch("/api/sync/header", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { about?: string; energyLevel?: EnergyLevel };

        setProfile({ about: data.about ?? "" });
        setEnergyLevel(data.energyLevel ?? 5);
        setDraftAbout(data.about ?? "");
      } catch {
        // Ignore initial fetch errors and allow local interaction.
      }
    };

    void fetchHeaderState();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemDateTime({
        time: formatSystemTime(now),
        date: formatSystemDate(now),
      });
    };

    updateTime();
    const intervalId = globalThis.setInterval(updateTime, 60_000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  const openProfileDialog = () => {
    setDraftAbout(profile.about);
    setIsProfileOpen(true);
  };

  const openEnergyDialog = () => {
    setIsEnergyOpen(true);
  };

  const openCustomFocusDialog = () => {
    setIsCustomFocusOpen(true);
  };

  const closeCustomFocusDialog = () => {
    setIsCustomFocusOpen(false);
  };

  const startCustomFocusMode = () => {
    const taskName = focusTaskName.trim();

    if (!taskName) {
      return;
    }

    const parsedTags = focusTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    startFocusMode({
      taskName,
      deadline: focusDeadline || undefined,
      expectedTime: focusExpectedTime.trim() || undefined,
      tags: parsedTags,
      notes: focusNotes.trim() || undefined,
    });

    setIsCustomFocusOpen(false);
    setFocusTaskName("");
    setFocusDeadline("");
    setFocusExpectedTime("");
    setFocusTags("");
    setFocusNotes("");
  };

  const saveProfile = () => {
    setProfile({ about: draftAbout.trim() });
    setIsProfileOpen(false);
  };

  const saveEnergy = () => {
    setIsEnergyOpen(false);
  };

  const syncHeaderState = async () => {
    setSyncStatus("syncing");

    try {
      const response = await fetch("/api/sync/header", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about: profile.about,
          energyLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  };

  const downloadHeaderState = async () => {
    setSyncStatus("syncing");

    try {
      const response = await fetch("/api/sync/header", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Fetch failed");
      }

      const data = (await response.json()) as { about?: string; energyLevel?: EnergyLevel };

      setProfile({ about: data.about ?? "" });
      setEnergyLevel(data.energyLevel ?? 5);
      setDraftAbout(data.about ?? "");
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  };

  return (
    <>
      <header className="relative shrink-0 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <div className="absolute right-3 top-3 text-right sm:right-4 sm:top-4">
          <p suppressHydrationWarning className="text-[10px] uppercase tracking-[0.2em] text-text-soft">
            {systemDateTime?.time ?? "--:--"}
          </p>
          <p suppressHydrationWarning className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-text-soft/85">
            {systemDateTime?.date ?? "---, --- --"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1
            className={`${orbitron.className} text-center text-lg font-bold uppercase tracking-widest text-brand sm:text-xl`}
          >
            {APP_NAME}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={openProfileDialog}
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-text-soft transition hover:border-white hover:text-white"
              aria-label="Edit about information"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={openEnergyDialog}
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-text-soft transition hover:border-white hover:text-white"
              aria-label="Set current energy level"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={openCustomFocusDialog}
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-text-soft transition hover:border-white hover:text-white"
              aria-label="Start custom focus mode"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={downloadHeaderState}
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-text-soft transition hover:border-white hover:text-white"
              aria-label="Download header information from cloud"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 17H7a4 4 0 1 1 .8-7.92A5.5 5.5 0 0 1 18.4 10H19a3 3 0 1 1 0 6h-3" />
                <path d="M12 11v8" />
                <path d="m8.5 15.5 3.5 3.5 3.5-3.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={syncHeaderState}
              className="inline-flex h-9 items-center justify-center border border-brand bg-brand px-3 text-[10px] uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90"
              aria-label="Sync header information"
            >
              Sync
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-soft">
            {syncStatus === "syncing" && "Syncing..."}
            {syncStatus === "synced" && "Synced"}
            {syncStatus === "error" && "Sync failed"}
            {syncStatus === "idle" && ""}
          </p>
        </div>
      </header>

      <ProfileDialog
        about={draftAbout}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onAboutChange={setDraftAbout}
        onSave={saveProfile}
      />
      <EnergyDialog
        isOpen={isEnergyOpen}
        level={energyLevel}
        onClose={() => setIsEnergyOpen(false)}
        onLevelChange={setEnergyLevel}
        onSave={saveEnergy}
      />

      {isCustomFocusOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
                Custom Focus Mode
              </h3>
              <button
                type="button"
                onClick={closeCustomFocusDialog}
                className="text-xs uppercase tracking-[0.2em] text-text-soft transition hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">Task Name</span>
                <input
                  value={focusTaskName}
                  onChange={(event) => setFocusTaskName(event.target.value)}
                  placeholder="What are you focusing on?"
                  className="mt-1.5 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
                />
              </label>

              <label className="block">
                <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">Deadline</span>
                <input
                  type="date"
                  value={focusDeadline}
                  onChange={(event) => setFocusDeadline(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-brand"
                />
              </label>

              <label className="block">
                <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">Expected Time</span>
                <input
                  value={focusExpectedTime}
                  onChange={(event) => setFocusExpectedTime(event.target.value)}
                  placeholder="e.g. 45 mins"
                  className="mt-1.5 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">Tags</span>
                <input
                  value={focusTags}
                  onChange={(event) => setFocusTags(event.target.value)}
                  placeholder="Comma separated tags"
                  className="mt-1.5 w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="block text-xs uppercase tracking-[0.18em] text-text-soft">Notes</span>
                <textarea
                  value={focusNotes}
                  onChange={(event) => setFocusNotes(event.target.value)}
                  placeholder="Any details for this focus session"
                  className="mt-1.5 min-h-24 w-full resize-none rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-soft focus:border-brand"
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCustomFocusDialog}
                className="rounded-xl border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-soft transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startCustomFocusMode}
                className="rounded-xl border border-brand bg-brand px-4 py-2 text-xs uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90"
              >
                Start Focus
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
