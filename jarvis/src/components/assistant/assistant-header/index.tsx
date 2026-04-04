"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/constants/branding";
import { orbitron } from "@/lib/fonts";
import { type AssistantProfile, type EnergyLevel } from "@/types/assistant";
import { EnergyDialog } from "./energy-dialog";
import { ProfileDialog } from "./profile-dialog";

const INITIAL_PROFILE: AssistantProfile = {
  about: "",
};

function formatSystemTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSystemDate(date: Date) {
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
}

export function AssistantHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnergyOpen, setIsEnergyOpen] = useState(false);
  const [profile, setProfile] = useState<AssistantProfile>(INITIAL_PROFILE);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(5);
  const [draftAbout, setDraftAbout] = useState(profile.about);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [systemDateTime, setSystemDateTime] = useState(() => {
    const now = new Date();
    return {
      time: formatSystemTime(now),
      date: formatSystemDate(now),
    };
  });

  useEffect(() => {
    const fetchHeaderState = async () => {
      try {
        const response = await fetch("/api/sync/header", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { about?: string };

        setProfile({ about: data.about ?? "" });
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

  return (
    <>
      <header className="relative shrink-0 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <div className="absolute right-3 top-3 text-right sm:right-4 sm:top-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-soft">{systemDateTime.time}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-text-soft/85">{systemDateTime.date}</p>
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
    </>
  );
}
