"use client";

import { cn } from "@/lib/utils";
import { useCallback } from "react";

export type TimelineOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

const timelineOptions: TimelineOption[] = [
  {
    value: "asap-1month",
    label: "ASAP within 1 month",
    description: "Quick turnaround, focused scope",
    icon: "⚡",
  },
  {
    value: "1-3months",
    label: "1–3 months",
    description: "Standard project timeline",
    icon: "📅",
  },
  {
    value: "3-6months",
    label: "3–6 months",
    description: "Larger project with more features",
    icon: "🏗️",
  },
  {
    value: "6plus-months",
    label: "6+ months",
    description: "Complex, long-term engagement",
    icon: "🌱",
  },
  {
    value: "flexible",
    label: "Schedule is flexible",
    description: "No rush — we can plan around your availability",
    icon: "🕊️",
  },
];

type TimelineSelectorProps = {
  selected: string | null;
  onSelect: (option: TimelineOption) => void;
  disabled?: boolean;
};

export function TimelineSelector({
  selected,
  onSelect,
  disabled,
}: TimelineSelectorProps) {
  const handleSelect = useCallback(
    (option: TimelineOption) => {
      if (disabled) return;
      onSelect(option);
    },
    [disabled, onSelect]
  );

  return (
    <div className="grid gap-2">
      {timelineOptions.map((option) => {
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
            aria-label={`Select timeline: ${option.label}`}
          >
            {/* Icon */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--surface-soft)] text-base">
              {option.icon}
            </span>

            {/* Text */}
            <span className="grid gap-0.5 min-w-0 flex-1">
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
          </button>
        );
      })}
    </div>
  );
}
