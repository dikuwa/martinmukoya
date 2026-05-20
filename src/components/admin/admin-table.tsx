import { ClearFiltersButton } from "@/components/admin/clear-filters-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export { SelectFilter } from "@/components/admin/select-filter";
import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

type Column<T> = {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

export function AdminTable<T>({
  items,
  columns,
  empty,
  editHref,
  actionLabel = "Edit"
}: {
  items: T[];
  columns: Array<Column<T>>;
  empty: string;
  editHref?: (item: T) => string;
  actionLabel?: string;
}) {
  return (
    <div className="admin-table-container overflow-hidden rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[var(--shadow-xs)]">
      <Table>
        <TableHeader>
          <TableRow className="border-[color:var(--border-subtle)] bg-[color:var(--surface)] hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.header} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {editHref ? <TableHead className="w-24 text-right">Action</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (editHref ? 1 : 0)} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[color:var(--text-faint)]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  <p className="text-sm text-[color:var(--text-muted)]">{empty}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={index} className="border-[color:var(--border-subtle)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-soft)]">
                {columns.map((column) => (
                  <TableCell key={column.header} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
                {editHref ? (
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={editHref(item)}>{actionLabel}</Link>
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function AdminFilters({
  search,
  filters,
  clearHref
}: {
  search?: string;
  filters?: ReactNode;
  clearHref?: string;
}) {
  return (
    <form className="flex flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-xs)] md:flex-row md:items-end">
      <div className="relative flex-1">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-faint)]" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search records..."
          className="h-11 w-full rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] pl-9 pr-4 text-sm text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:bg-[color:var(--surface-soft)] focus:border-[color:var(--primary)] focus:bg-[color:var(--surface)]"
        />
      </div>
      {filters}
      <Button type="submit" variant="secondary" className="md:self-end">
        Filter
      </Button>
      {clearHref ? <ClearFiltersButton href={clearHref} /> : null}
    </form>
  );
}
