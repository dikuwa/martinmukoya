import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(198,97,63,0.35)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[color:var(--text-muted)]">{label}</p>
          <p className="mt-3 font-display text-3xl font-black text-[color:var(--text-strong)]">
            {value}
          </p>
        </div>
        {visual ? (
          <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-[rgba(198,97,63,0.12)]">
            {visual}
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm text-[color:var(--text-muted)]">{detail}</p> : null}
    </div>
  );
}
