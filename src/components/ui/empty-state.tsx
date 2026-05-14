import Image from "next/image";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-8 text-center">
      <div className="relative mb-6 aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-[18px] bg-[color:var(--surface-soft)]">
        <Image src="/assets/site/01.JPG" alt="" fill className="object-cover opacity-80" sizes="220px" />
      </div>
      <h2 className="font-display text-2xl font-black text-[color:var(--text-strong)]">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
