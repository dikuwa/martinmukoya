"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="max-w-md rounded-[18px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-8 text-center">
        <h1 className="font-display text-3xl font-black text-[color:var(--text-strong)]">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
          The page hit an error while loading. Refreshing this section is the quickest next step.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
