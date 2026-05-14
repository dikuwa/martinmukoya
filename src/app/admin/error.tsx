"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-[18px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-8">
      <h1 className="font-display text-3xl font-black text-[color:var(--text-strong)]">Admin section failed to load</h1>
      <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
        Try refreshing the dashboard section. If it persists, check auth and database environment variables.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
