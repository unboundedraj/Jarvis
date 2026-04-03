import { APP_FULL_FORM, APP_NAME } from "@/constants/branding";
import { EnterPortalButton } from "@/components/landing/enter-portal-button";
import { ParticleField } from "@/components/landing/particle-field";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "900"],
});

export function HeroSection() {
  return (
    <main className="relative flex min-h-screen w-full items-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
      <ParticleField />
      <section className="relative z-10 mx-auto w-full max-w-6xl text-center">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-soft sm:text-xs">
          Personal Productivity Assistant
        </p>
        <h1
          className={`${orbitron.className} text-5xl font-black uppercase tracking-widest text-white sm:text-6xl md:text-7xl lg:text-8xl`}
        >
          {APP_NAME}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-text-soft sm:text-base">
          {APP_FULL_FORM}
        </p>
        <div className="mt-10 flex justify-center">
          <EnterPortalButton />
        </div>
      </section>
      <p className="absolute inset-x-0 bottom-4 z-10 text-center text-[10px] uppercase tracking-[0.18em] text-text-soft sm:bottom-6 sm:text-xs">
        Built by Unboundedraj
      </p>
    </main>
  );
}
