"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/constants/branding";
import { orbitron } from "@/lib/fonts";

type AssistantAccessGateProps = {
  pinConfigured: boolean;
};

export function AssistantAccessGate({ pinConfigured }: AssistantAccessGateProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!pin.trim()) {
      setError("Enter the access PIN.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? "Invalid PIN.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to verify the PIN right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-lg rounded-3xl border border-border bg-surface/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.35em] text-text-soft">Private access</p>
          <h1 className={`${orbitron.className} text-3xl font-bold uppercase tracking-[0.32em] text-brand sm:text-4xl`}>
            {APP_NAME}
          </h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-text-soft">
            This deployment is PIN-protected. Enter the access code to open the assistant workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-left text-[10px] uppercase tracking-[0.24em] text-text-soft" htmlFor="access-pin">
            Access PIN
          </label>
          <input
            id="access-pin"
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            autoComplete="one-time-code"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text outline-none transition placeholder:text-text-soft/60 focus:border-brand"
            placeholder="Enter your PIN"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-brand bg-brand px-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-contrast transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Checking..." : "Unlock"}
          </button>
        </form>

        <div className="space-y-2 text-sm text-text-soft">
          {error ? <p className="text-red-400">{error}</p> : null}
          {!pinConfigured ? (
            <p>
              Set <span className="text-text">JARVIS_ACCESS_PIN</span> in your environment before deploying or sharing the app.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}