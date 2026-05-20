"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      {/* Atmospheric background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[color:var(--primary)] opacity-[0.06] blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-[color:var(--accent)] opacity-[0.04] blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[200px] w-[200px] rounded-full bg-[color:var(--primary-light)] opacity-[0.03] blur-[80px]" />
        <div
          className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:48px_48px] transition-opacity duration-700 ${mounted ? "opacity-30" : "opacity-0"}`}
        />
      </div>

      {/* Center panel */}
      <div className="relative z-10 mx-auto max-w-lg">
        <div className="rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/60 p-10 text-center shadow-[0_8px_40px_rgba(107,38,217,0.08)] backdrop-blur-sm sm:p-14">
          {/* Abstract system indicator */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/50">
            <div className="relative flex h-6 w-6 items-center justify-center">
              <div className="absolute h-5 w-5 animate-pulse rounded-full border border-[color:var(--primary)]/30" />
              <div className="h-2 w-2 rounded-full bg-[color:var(--primary)]/50" />
            </div>
          </div>

          <h1 className="font-display text-3xl font-black leading-tight text-[color:var(--text-strong)] sm:text-4xl">
            This page lost its flow for a moment.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[color:var(--text-muted)]">
            The system hit a temporary issue while loading this section. Refreshing the page usually gets everything moving again.
          </p>

          <Button className="mt-8" onClick={reset}>
            Refresh page
          </Button>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[color:var(--text-faint)]">
            <Link href="/" className="transition hover:text-[color:var(--text-muted)]">
              Return home
            </Link>
            <span className="text-[color:var(--border)]">·</span>
            <span className="cursor-default">Try again later</span>
          </div>
        </div>
      </div>
    </div>
  );
}
