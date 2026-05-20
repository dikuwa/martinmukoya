import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-normal)]",
  primary: "border-[color:var(--primary)]/30 bg-[rgba(107,38,217,0.08)] text-[color:var(--primary)]",
  success: "border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]",
  warning: "border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] text-[#f59e0b]",
  danger: "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
};

export function Badge({ className, variant = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold leading-normal tracking-wide",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
