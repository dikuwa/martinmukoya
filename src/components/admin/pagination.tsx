import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/30 disabled:pointer-events-none disabled:opacity-40";

function buildQuery(params: Record<string, string | undefined>, page: number) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value || key === "page") return;
    query.set(key, value);
  });

  query.set("page", String(page));
  return query.toString();
}

export function AdminPagination({
  page,
  pageCount,
  params,
  basePath
}: {
  page: number;
  pageCount: number;
  params: Record<string, string | undefined>;
  basePath: string;
}) {
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(pageCount, page + 1);
  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-xs)] md:flex-row md:items-center md:justify-between">
      <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
        Page <span className="text-[color:var(--text-strong)]">{page}</span> of {pageCount}
      </p>
      <div className="inline-flex flex-wrap items-center gap-2">
        {hasPrevious ? (
          <Link href={`${basePath}?${buildQuery(params, prevPage)}`} className={buttonClass}>
            <ChevronLeft size={14} />
            Previous
          </Link>
        ) : (
          <span className={`${buttonClass} opacity-40`} aria-disabled="true">
            <ChevronLeft size={14} />
            Previous
          </span>
        )}
        {hasNext ? (
          <Link href={`${basePath}?${buildQuery(params, nextPage)}`} className={buttonClass}>
            Next
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className={`${buttonClass} opacity-40`} aria-disabled="true">
            Next
            <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  );
}
