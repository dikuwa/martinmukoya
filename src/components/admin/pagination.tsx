import Link from "next/link";

const buttonClass =
  "inline-flex items-center justify-center rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[color:var(--text-strong)] transition hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-50";

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
    <div className="flex flex-col gap-3 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 md:flex-row md:items-center md:justify-between">
      <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-faint)]">
        Page {page} of {pageCount}
      </p>
      <div className="inline-flex flex-wrap items-center gap-2">
        {hasPrevious ? (
          <Link href={`${basePath}?${buildQuery(params, prevPage)}`} className={buttonClass}>
            Previous
          </Link>
        ) : (
          <span className={`${buttonClass} opacity-50`} aria-disabled="true">
            Previous
          </span>
        )}
        {hasNext ? (
          <Link href={`${basePath}?${buildQuery(params, nextPage)}`} className={buttonClass}>
            Next
          </Link>
        ) : (
          <span className={`${buttonClass} opacity-50`} aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
