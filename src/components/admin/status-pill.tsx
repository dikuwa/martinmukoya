import { cn } from "@/lib/utils";

export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        tone === "neutral" && "border-[color:var(--border-subtle)] bg-white/[0.04] text-[color:var(--text-muted)]",
        tone === "success" && "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.1)] text-[#22C55E]",
        tone === "warning" && "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] text-[#F59E0B]",
        tone === "accent" && "border-[rgba(198,97,63,0.35)] bg-[rgba(198,97,63,0.1)] text-[color:var(--accent-light)]"
      )}
    >
      {children}
    </span>
  );
}
