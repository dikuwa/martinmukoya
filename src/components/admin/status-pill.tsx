import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "warning" | "accent" | "danger";

const toneStyles: Record<StatusTone, string> = {
  neutral: "border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-muted)]",
  success: "border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]",
  warning: "border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] text-[#f59e0b]",
  accent: "border-[color:var(--primary)]/30 bg-[rgba(107,38,217,0.12)] text-[color:var(--primary)]",
  danger: "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
};

export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: StatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide",
        toneStyles[tone]
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        tone === "neutral" && "bg-[color:var(--text-faint)]",
        tone === "success" && "bg-[#22c55e]",
        tone === "warning" && "bg-[#f59e0b]",
        tone === "accent" && "bg-[color:var(--primary)]",
        tone === "danger" && "bg-[#ef4444]"
      )} />
      {children}
    </span>
  );
}
