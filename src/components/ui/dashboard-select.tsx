"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export interface DashboardSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DashboardSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children" | "onChange"> {
  options: readonly DashboardSelectOption[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

type MenuPosition = { top: number; left: number; width: number; maxHeight: number };

export const DashboardSelect = forwardRef<HTMLSelectElement, DashboardSelectProps>(
  ({
    options, placeholder, className, disabled, onChange, value, defaultValue,
    name, searchable, "aria-label": ariaLabel, ...selectProps
  }, ref) => {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [position, setPosition] = useState<MenuPosition | null>(null);
    const [internalValue, setInternalValue] = useState(() => String(defaultValue ?? options[0]?.value ?? ""));
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const selectedValue = value === undefined ? internalValue : String(value);
    const selectedOption = useMemo(
      () => options.find(option => option.value === selectedValue),
      [options, selectedValue],
    );
    const filteredOptions = useMemo(
      () => searchable && search.trim()
        ? options.filter(option => option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
        : options,
      [options, searchable, search],
    );

    // Render in a portal, outside Card and label overflow containers. Previously
    // those containers clipped the options and made the selects appear stuck.
    const placeMenu = useCallback(() => {
      const rectangle = triggerRef.current?.getBoundingClientRect();
      if (!rectangle) return;
      const gap = 6;
      const availableBelow = window.innerHeight - rectangle.bottom - gap - 8;
      const availableAbove = rectangle.top - gap - 8;
      const above = availableBelow < 160 && availableAbove > availableBelow;
      const maxHeight = Math.max(100, Math.min(288, above ? availableAbove : availableBelow));
      const width = Math.min(Math.max(rectangle.width, 180), window.innerWidth - 16);
      setPosition({
        top: above ? Math.max(8, rectangle.top - maxHeight - gap) : rectangle.bottom + gap,
        left: Math.max(8, Math.min(rectangle.left, window.innerWidth - width - 8)),
        width,
        maxHeight,
      });
    }, []);

    useEffect(() => {
      if (!open) return;
      placeMenu();
      if (searchable) searchRef.current?.focus();
      const outsideClick = (event: PointerEvent) => {
        const target = event.target as Node;
        if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
          setOpen(false);
        }
      };
      const onViewportChange = () => placeMenu();
      document.addEventListener("pointerdown", outsideClick);
      window.addEventListener("resize", onViewportChange);
      window.addEventListener("scroll", onViewportChange, true);
      return () => {
        document.removeEventListener("pointerdown", outsideClick);
        window.removeEventListener("resize", onViewportChange);
        window.removeEventListener("scroll", onViewportChange, true);
      };
    }, [open, placeMenu, searchable]);

    function choose(option: DashboardSelectOption) {
      if (option.disabled) return;
      if (value === undefined) setInternalValue(option.value);
      onChange?.({
        target: { value: option.value, name },
        currentTarget: { value: option.value, name },
      } as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
      setSearch("");
      triggerRef.current?.focus();
    }

    function toggle() {
      if (disabled) return;
      if (open) {
        setOpen(false);
      } else {
        setSearch("");
        placeMenu();
        setOpen(true);
      }
    }

    return (
      <div className="relative min-w-0">
        <select
          {...selectProps}
          name={name}
          value={selectedValue}
          onChange={event => {
            if (value === undefined) setInternalValue(event.target.value);
            onChange?.(event);
          }}
          disabled={disabled}
          ref={ref}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          {options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${id}-listbox` : undefined}
          disabled={disabled}
          onClick={toggle}
          onKeyDown={event => {
            if (event.key === "Escape") {
              setOpen(false);
            } else if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              toggle();
            }
          }}
          className={cn(
            "flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-left text-sm font-medium normal-case tracking-normal text-[color:var(--text-strong)] outline-none transition",
            "hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/40 focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="min-w-0 line-clamp-2 break-words leading-normal text-[color:var(--text-strong)]">
            {selectedOption?.label ?? placeholder ?? "Select..."}
          </span>
          <ChevronDown size={16} className={cn("shrink-0 text-[color:var(--text-faint)] transition", open && "rotate-180")} />
        </button>
        {open && position && typeof document !== "undefined" && createPortal(
          <div
            ref={menuRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-label={ariaLabel ?? placeholder ?? name ?? "Select an option"}
            onKeyDown={event => {
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
              }
            }}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
              zIndex: 10000,
            }}
            className="flex flex-col gap-1 overflow-hidden rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-1 shadow-[var(--shadow-sm)]"
          >
            {searchable && (
              <div className="flex shrink-0 items-center gap-2 rounded-sm border border-[color:var(--border-subtle)] px-2">
                <Search size={15} className="text-[color:var(--text-muted)]" />
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search options..."
                  aria-label="Search options"
                  className="h-9 w-full min-w-0 bg-transparent text-sm font-normal outline-none"
                />
              </div>
            )}
            <div className="min-h-0 overflow-y-auto overscroll-contain">
              {filteredOptions.map(option => {
                const active = option.value === selectedValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={option.disabled}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => choose(option)}
                    className={cn(
                      "flex min-h-10 w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-medium normal-case tracking-normal text-[color:var(--text-muted)] transition",
                      "hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      active && "bg-[color:var(--surface-soft)] text-[color:var(--text-strong)]",
                    )}
                  >
                    <span className="w-4 shrink-0 text-[color:var(--primary)]" aria-hidden="true">
                      {active ? <Check size={14} /> : null}
                    </span>
                    <span className="min-w-0 break-words">{option.label}</span>
                  </button>
                );
              })}
              {filteredOptions.length === 0 && (
                <p className="p-3 text-sm text-[color:var(--text-muted)]">No matching options.</p>
              )}
            </div>
          </div>,
          // Radix dialogs enforce an interaction/focus boundary. Keep the
          // popup inside the active dialog when one exists, otherwise use body.
          // Fixed positioning prevents card and scrolling-panel clipping.
          triggerRef.current?.closest<HTMLElement>('[role="dialog"]') ?? document.body,
        )}
      </div>
    );
  },
);

DashboardSelect.displayName = "DashboardSelect";
