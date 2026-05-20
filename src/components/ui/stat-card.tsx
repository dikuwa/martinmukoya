import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  visual?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, detail, visual, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-xs)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[color:var(--surface-soft)] hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">{label}</p>
          <p className="mt-2 font-display text-[clamp(1.5rem,2.5vw,2rem)] font-black leading-none tracking-tight text-[color:var(--text-strong)]">
            {value}
          </p>
        </div>
        {visual ? (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color:var(--primary)]/10 text-[color:var(--primary)] transition-colors group-hover:bg-[color:var(--primary)]/15">
            {visual}
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-2.5 text-xs leading-5 text-[color:var(--text-muted)]">{detail}</p> : null}
    </div>
  );
}
