import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-0.5 text-[0.65rem] font-bold text-[color:var(--text-normal)]",
        className
      )}
      {...props}
    />
  );
}
