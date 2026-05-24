"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid gap-8">
      <div className="flex flex-col items-center justify-center rounded-[18px] border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] p-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.1)]">
          <AlertTriangle size={28} className="text-error" />
        </div>
        <h1 className="text-balance font-display text-2xl font-black text-[color:var(--text-strong)] md:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-base leading-7 text-[color:var(--text-muted)]">
          The admin section failed to load. This could be a temporary issue with the database connection or authentication.
        </p>
        <Button className="mt-8 rounded-[12px]" onClick={reset}>
          <RefreshCw size={16} />
          Try again
        </Button>
      </div>
    </div>
  );
}
