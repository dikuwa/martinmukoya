import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[color:var(--primary)] opacity-[0.06] blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-[color:var(--accent)] opacity-[0.04] blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 h-[200px] w-[200px] rounded-full bg-[color:var(--primary-light)] opacity-[0.03] blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:48px_48px] opacity-30" />
      </div>

      {/* Center panel */}
      <div className="relative z-10 mx-auto max-w-lg">
        <div className="rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/60 p-10 text-center shadow-[0_8px_40px_rgba(107,38,217,0.08)] backdrop-blur-sm sm:p-14">
          {/* Code indicator */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/50">
            <span className="font-display text-lg font-black text-[color:var(--primary)]">404</span>
          </div>

          <h1 className="font-display text-3xl font-black leading-tight text-[color:var(--text-strong)] sm:text-4xl">
            Page not found
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[color:var(--text-muted)]">
            This page is not part of the portfolio yet, or the link has moved.
          </p>

          <Button asChild className="mt-8">
            <Link href="/">Back home</Link>
          </Button>

          <div className="mt-6 text-xs text-[color:var(--text-faint)]">
            Try navigating from the menu above.
          </div>
        </div>
      </div>
    </div>
  );
}
