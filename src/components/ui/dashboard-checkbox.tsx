"use client";

import { Check } from "lucide-react";
import { useId, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type DashboardCheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
  labelClassName?: string;
  indeterminate?: boolean;
};

export function DashboardCheckbox({
  label,
  description,
  labelClassName,
  indeterminate,
  className,
  id: providedId,
  disabled,
  required,
  checked,
  defaultChecked,
  onChange,
  ...props
}: DashboardCheckboxProps) {
  const generatedId = useId();
  const id = providedId || generatedId;

  useEffect(() => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (input && indeterminate !== undefined) {
      input.indeterminate = indeterminate;
    }
  }, [id, indeterminate]);

  return (
    <label
      className={cn(
        "inline-flex items-start gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative flex shrink-0">
        <input
          id={id}
          type="checkbox"
          className={cn(
            "sr-only peer",
            disabled && "cursor-not-allowed"
          )}
          disabled={disabled}
          required={required}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          {...props}
        />
        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-[4px] border-2 transition-all duration-200",
            "border-[color:var(--border-subtle)] bg-[color:var(--surface)]",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--background)]",
            "peer-hover:border-[color:var(--primary)]/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "peer-checked:bg-[color:var(--primary)] peer-checked:border-[color:var(--primary)]",
            className
          )}
          aria-hidden="true"
        >
          <Check
            size={12}
            className="text-white stroke-2 transition-opacity opacity-0 peer-checked:opacity-100"
            strokeWidth={3}
            aria-hidden="true"
          />
        </div>
      </div>
      {(label || description) && (
        <div className={cn("grid gap-1 text-sm font-bold text-[color:var(--text-strong)]", labelClassName)}>
          {label && <span>{label}</span>}
          {description && (
            <span className="text-xs font-normal text-[color:var(--text-muted)]">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

DashboardCheckbox.displayName = "DashboardCheckbox";