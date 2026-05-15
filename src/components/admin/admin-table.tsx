import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Column<T> = {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

export function AdminTable<T>({
  items,
  columns,
  empty,
  editHref
}: {
  items: T[];
  columns: Array<Column<T>>;
  empty: string;
  editHref?: (item: T) => string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_3px_10px_rgba(0,0,0,0.06)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
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
              <TableCell colSpan={columns.length + (editHref ? 1 : 0)} className="py-10 text-center text-[color:var(--text-muted)]">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={index} className="border-[color:var(--border-subtle)] hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <TableCell key={column.header} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
                {editHref ? (
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={editHref(item)}>Edit</Link>
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
  filters
}: {
  search?: string;
  filters?: ReactNode;
}) {
  return (
    <form className="flex flex-col gap-3 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 md:flex-row md:items-center">
      <input
        name="search"
        defaultValue={search}
        placeholder="Search records..."
        className="h-11 flex-1 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 text-sm text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)]"
      />
      {filters}
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}

export function SelectFilter({
  name,
  value,
  options,
  label
}: {
  name: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  label: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
      {label}
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-11 min-w-40 rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 text-sm normal-case tracking-normal text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)]"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
