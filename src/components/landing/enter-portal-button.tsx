"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function EnterPortalButton() {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("particle-boost");
    };
  }, []);

  const handleEnter = () => {
    if (isOpening) {
      return;
    }

    setIsOpening(true);
    document.documentElement.classList.add("particle-boost");

    window.setTimeout(() => {
      router.push("/assistant");
    }, 1800);
  };

  return (
    <button
      type="button"
      onClick={handleEnter}
      className="group relative inline-flex min-h-10 items-center justify-center border border-white/40 bg-black/20 px-8 py-2 text-sm font-semibold tracking-[0.2em] text-white transition duration-300 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span className="relative z-10 uppercase">Enter</span>
      <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 blur-md transition duration-300 group-hover:opacity-100" />
    </button>
  );
}
