"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type SelectFilterProps = {
  name: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  label: string;
};

export function SelectFilter({ name, value, options, label }: SelectFilterProps) {
  const routeValue = value ?? "";
  const [selection, setSelection] = useState({ routeValue, selected: routeValue });
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  let selected = selection.selected;

  if (selection.routeValue !== routeValue) {
    selected = routeValue;
    setSelection({ routeValue, selected: routeValue });
  }

  const selectedLabel = useMemo(() => {
    if (!selected) return "All";
    return options.find((option) => option.value === selected)?.label ?? "All";
  }, [options, selected]);

  function choose(nextValue: string) {
    setSelection({ routeValue, selected: nextValue });
    setOpen(false);
  }

  const renderedOptions = useMemo(() => {
    const seen = new Set<string>();

    return [{ label: "All", value: "" }, ...options].filter((option) => {
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
  }, [options]);

  return (
    <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
      {label}
      <input type="hidden" name={name} value={selected} />
      <div ref={wrapperRef} className="relative min-w-40">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          onBlur={(event) => {
            if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
          }}
          className="flex h-11 w-full items-center justify-between gap-3 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-left text-sm font-semibold normal-case tracking-normal text-[color:var(--text-strong)] outline-none transition hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/40 focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)]"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown size={15} className="shrink-0 text-[color:var(--text-faint)] transition aria-expanded:rotate-180" />
        </button>
        {open ? (
          <div
            role="listbox"
            className="absolute left-0 top-[calc(100%+0.45rem)] z-50 grid w-full min-w-48 overflow-hidden rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-1 shadow-[var(--shadow-sm)]"
          >
            {renderedOptions.map((option, index) => {
              const active = option.value === selected;

              return (
                <button
                  key={`${name}-${option.value || "all"}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option.value)}
                  className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-left text-sm font-semibold normal-case tracking-normal text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] aria-selected:bg-[color:var(--surface-soft)] aria-selected:text-[color:var(--text-strong)]"
                >
                  <span className="w-4 text-[color:var(--primary)]">{active ? "✓" : ""}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </label>
  );
}
