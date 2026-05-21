import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-[color:var(--border-subtle)] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <Badge className="mb-4">{eyebrow}</Badge> : null}
        <h1 className="text-balance font-display text-3xl font-black tracking-normal text-[color:var(--text-strong)] md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
