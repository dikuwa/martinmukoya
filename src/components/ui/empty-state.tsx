import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div className={cn("grid place-items-center rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-6 py-12 text-center", className)}>
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--surface-soft)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[color:var(--text-faint)]">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="mt-5 font-display text-xl font-black text-[color:var(--text-strong)]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
