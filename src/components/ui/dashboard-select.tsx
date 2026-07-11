"use client";

import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef, useId, useRef, useState, useEffect, useMemo } from "react";

export interface DashboardSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DashboardSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children" | "onChange"> {
  options: readonly DashboardSelectOption[];
  placeholder?: string;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DashboardSelect = forwardRef<HTMLSelectElement, DashboardSelectProps>(
  ({ options, placeholder, className, disabled, onChange, value, defaultValue, name, "aria-label": ariaLabel }, ref) => {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(() => String(defaultValue ?? options[0]?.value ?? ""));
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const selectedValue = value === undefined ? internalValue : String(value);

    const selectedOption = useMemo(
      () => options.find((opt) => opt.value === selectedValue),
      [options, selectedValue]
    );

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
      if (open) {
        triggerRef.current?.focus();
      }
    }, [open]);

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown" && !open) {
        e.preventDefault();
        setOpen(true);
      }
    }

    return (
      <div ref={wrapperRef} className="relative">
        <select
          name={name}
          value={selectedValue}
          onChange={(event) => {
            if (value === undefined) setInternalValue(event.target.value);
            onChange?.(event);
          }}
          disabled={disabled}
          ref={ref}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          disabled={disabled}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-3 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-left text-sm font-semibold normal-case tracking-normal text-[color:var(--text-strong)] outline-none transition",
            "hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/40",
            "focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        >
          <span className="truncate text-[color:var(--text-muted)]">
            {selectedOption?.label ?? placeholder ?? "Select..."}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              "shrink-0 text-[color:var(--text-faint)] transition",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="absolute left-0 top-[calc(100%+0.45rem)] z-50 grid w-full min-w-[12rem] overflow-hidden rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-1 shadow-[var(--shadow-sm)]"
          >
            {options.map((option) => {
              const active = option.value === selectedValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (value === undefined) setInternalValue(option.value);
                    onChange?.({
                      target: { value: option.value, name },
                    } as React.ChangeEvent<HTMLSelectElement>);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-[9px] px-3 py-2 text-left text-sm font-semibold normal-case tracking-normal text-[color:var(--text-muted)] transition",
                    "hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]",
                    active && "bg-[color:var(--surface-soft)] text-[color:var(--text-strong)]"
                  )}
                >
                  <span className="w-4 text-[color:var(--primary)] shrink-0" aria-hidden="true">
                    {active ? <Check size={14} /> : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

DashboardSelect.displayName = "DashboardSelect";
