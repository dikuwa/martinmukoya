import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5",
        className
      )}
    >
      <div className="aspect-[16/10] rounded-[14px] bg-white/[0.06]" />
      <div className="mt-5 h-4 w-2/3 rounded bg-white/[0.07]" />
      <div className="mt-3 h-3 w-full rounded bg-white/[0.05]" />
      <div className="mt-2 h-3 w-4/5 rounded bg-white/[0.05]" />
    </div>
  );
}
