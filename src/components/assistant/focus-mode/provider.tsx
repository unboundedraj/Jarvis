"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { orbitron } from "@/lib/fonts";

type FocusModeStartPayload = {
  taskName: string;
  deadline?: string;
  expectedTime?: string;
  tags?: string[];
  notes?: string;
  onSessionEnd?: (wasSuccessful: boolean, elapsedSeconds: number) => Promise<void> | void;
};

type FocusModeContextValue = {
  startFocusMode: (payload: FocusModeStartPayload) => void;
};

const FALLBACK_CONTEXT: FocusModeContextValue = {
  startFocusMode: () => {
    // No-op fallback to avoid runtime crash if a consumer mounts outside the provider.
  },
};

const FocusModeContext = createContext<FocusModeContextValue>(FALLBACK_CONTEXT);

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

function FocusModeOverlay({
  payload,
  elapsedSeconds,
  isPaused,
  isSummaryOpen,
  isSubmitting,
  onTogglePause,
  onEndFocus,
  onDecision,
}: {
  payload: FocusModeStartPayload;
  elapsedSeconds: number;
  isPaused: boolean;
  isSummaryOpen: boolean;
  isSubmitting: boolean;
  onTogglePause: () => void;
  onEndFocus: () => void;
  onDecision: (wasSuccessful: boolean) => void;
}) {
  const particles = useMemo(() => Array.from({ length: 34 }, (_, index) => index), []);

  return (
    <div className="fixed inset-0 z-100 overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <span
            key={particle}
            className="focus-particle"
            style={{
              left: `${(particle * 11) % 100}%`,
              animationDuration: `${8 + (particle % 6) * 1.2}s`,
              animationDelay: `${-(particle % 7) * 0.9}s`,
              width: `${2 + (particle % 3)}px`,
              height: `${2 + (particle % 3)}px`,
              ["--focus-particle-drift" as string]: `${(particle % 2 === 0 ? 1 : -1) * (10 + (particle % 5) * 4)}px`,
            }}
          />
        ))}
      </div>

      <div className="relative flex h-full w-full flex-col px-4 py-5 sm:px-8 sm:py-8">
        <div className="self-end text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-soft">Focusing Currently On</p>
          <h2 className={`${orbitron.className} mt-1 text-sm uppercase tracking-[0.18em] text-brand sm:text-base`}>
            {payload.taskName}
          </h2>
        </div>

        <div className="mt-4 grid gap-2 text-[10px] uppercase tracking-[0.16em] text-text-soft sm:grid-cols-2 lg:grid-cols-4">
          <p>Deadline: {payload.deadline ?? "No deadline"}</p>
          <p>Expected: {payload.expectedTime ?? "Not set"}</p>
          <p>Tags: {payload.tags && payload.tags.length > 0 ? payload.tags.join(", ") : "No tags"}</p>
          <p className="sm:col-span-2 lg:col-span-1">Notes: {payload.notes?.trim() ? payload.notes : "No notes"}</p>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className={`${orbitron.className} text-center text-5xl font-semibold tracking-[0.2em] text-brand sm:text-7xl lg:text-8xl`}>
            {formatElapsed(elapsedSeconds)}
          </p>
        </div>

        <div className="mx-auto mb-2 flex w-full max-w-xl flex-col items-center gap-2">
          {!isSummaryOpen ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onTogglePause}
                className="rounded-lg border border-border px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-text-soft transition hover:border-white hover:text-white"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={onEndFocus}
                className="rounded-lg border border-brand bg-brand px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90"
              >
                End Focus Mode
              </button>
            </div>
          ) : (
            <div className="w-full rounded-xl border border-border bg-surface/80 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-soft">Session Summary</p>
              <p className={`${orbitron.className} mt-2 text-xl tracking-[0.16em] text-brand sm:text-2xl`}>
                {formatElapsed(elapsedSeconds)}
              </p>
              <p className="mt-3 text-xs text-text-soft">Were you successful in accomplishing this task?</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onDecision(true)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-brand bg-brand px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90 disabled:opacity-60"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => onDecision(false)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-border px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-text-soft transition hover:border-white hover:text-white disabled:opacity-60"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<FocusModeStartPayload | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!payload || isPaused || isSummaryOpen) {
      return;
    }

    const intervalId = globalThis.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [payload, isPaused, isSummaryOpen]);

  const startFocusMode = (nextPayload: FocusModeStartPayload) => {
    setPayload(nextPayload);
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsSummaryOpen(false);
    setIsSubmitting(false);
  };

  const closeFocusMode = () => {
    setPayload(null);
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsSummaryOpen(false);
    setIsSubmitting(false);
  };

  const handleDecision = async (wasSuccessful: boolean) => {
    if (!payload) {
      return;
    }

    setIsSubmitting(true);

    try {
      await payload.onSessionEnd?.(wasSuccessful, elapsedSeconds);
      closeFocusMode();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FocusModeContext.Provider value={{ startFocusMode }}>
      {children}
      {payload ? (
        <FocusModeOverlay
          payload={payload}
          elapsedSeconds={elapsedSeconds}
          isPaused={isPaused}
          isSummaryOpen={isSummaryOpen}
          isSubmitting={isSubmitting}
          onTogglePause={() => setIsPaused((current) => !current)}
          onEndFocus={() => {
            setIsPaused(true);
            setIsSummaryOpen(true);
          }}
          onDecision={handleDecision}
        />
      ) : null}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  return useContext(FocusModeContext);
}