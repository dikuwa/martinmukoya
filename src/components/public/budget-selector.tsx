"use client";

import { cn } from "@/lib/utils";
import { useCallback } from "react";

export type BudgetOption = {
  value: string;
  label: string;
  description: string;
};

const budgetOptions: BudgetOption[] = [
  {
    value: "under-15000",
    label: "Under N$15,000",
    description: "Simple website or landing page",
  },
  {
    value: "15000-50000",
    label: "N$15,000 – N$50,000",
    description: "Custom website or web app",
  },
  {
    value: "50000-100000",
    label: "N$50,000 – N$100,000",
    description: "Complex platform or system",
  },
  {
    value: "over-100000",
    label: "N$100,000+",
    description: "Enterprise solution or full platform",
  },
];

type BudgetSelectorProps = {
  selected: string | null;
  onSelect: (option: BudgetOption) => void;
  disabled?: boolean;
};

export function BudgetSelector({ selected, onSelect, disabled }: BudgetSelectorProps) {
  const handleSelect = useCallback(
    (option: BudgetOption) => {
      if (disabled) return;
      onSelect(option);
    },
    [disabled, onSelect]
  );

  return (
    <div className="grid gap-2">
      {budgetOptions.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option)}
            disabled={disabled}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 focus-visible:ring-offset-2",
              isSelected
                ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 shadow-[0_0_0_1px_var(--primary-alpha)]"
                : "border-[color:var(--border-subtle)] bg-[color:var(--surface)] hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--surface-soft)] hover:shadow-sm",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-pressed={isSelected}
            aria-label={`Select budget: ${option.label}`}
          >
            {/* Radio indicator */}
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
                isSelected
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]"
                  : "border-[color:var(--border-subtle)] group-hover:border-[color:var(--text-muted)]"
              )}
            >
              {isSelected && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>

            {/* Text */}
            <span className="grid gap-0.5 min-w-0">
              <span
                className={cn(
                  "text-sm font-bold transition-colors duration-200",
                  isSelected
                    ? "text-[color:var(--primary)]"
                    : "text-[color:var(--text-strong)]"
                )}
              >
                {option.label}
              </span>
              <span className="text-xs text-[color:var(--text-faint)]">
                {option.description}
              </span>
            </span>

            {/* Selected check */}
            {isSelected && (
              <span className="ml-auto shrink-0 text-[color:var(--primary)]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 8 6.5 11.5 13 4.5" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
