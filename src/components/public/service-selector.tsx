"use client";

import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

export type ServiceOption = {
  value: string;
  label: string;
  description: string;
};

const serviceOptions: ServiceOption[] = [
  {
    value: "web-applications",
    label: "Web Applications",
    description: "Dashboards, portals, business systems",
  },
  {
    value: "booking-systems",
    label: "Booking Systems",
    description: "Appointments, reservations, scheduling",
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    description: "Online stores, checkout, payment flows",
  },
  {
    value: "ai-automations",
    label: "AI Automations",
    description: "Chatbots, agents, workflow automation",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else we can help with",
  },
];

type ServiceSelectorProps = {
  selected: string[];
  onSelect: (values: string[]) => void;
  onCustomDetails: (details: string) => void;
  customDetails: string;
  disabled?: boolean;
};

export function ServiceSelector({
  selected,
  onSelect,
  onCustomDetails,
  customDetails,
  disabled,
}: ServiceSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleToggle = useCallback(
    (option: ServiceOption) => {
      if (disabled) return;

      if (option.value === "other") {
        const isAlreadySelected = selected.includes("other");
        if (isAlreadySelected) {
          onSelect(selected.filter((v) => v !== "other"));
          setShowCustomInput(false);
          onCustomDetails("");
        } else {
          onSelect([...selected, "other"]);
          setShowCustomInput(true);
        }
        return;
      }

      if (selected.includes(option.value)) {
        onSelect(selected.filter((v) => v !== option.value));
      } else {
        onSelect([...selected, option.value]);
      }
    },
    [disabled, selected, onSelect, onCustomDetails]
  );

  const isOtherSelected = selected.includes("other");

  return (
    <div className="grid gap-2">
      {serviceOptions.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option)}
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
            aria-label={`Select service: ${option.label}`}
          >
            {/* Checkbox indicator */}
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200",
                isSelected
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]"
                  : "border-[color:var(--border-subtle)] group-hover:border-[color:var(--text-muted)]"
              )}
            >
              {isSelected && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2.5 6 5 8.5 9.5 3" />
                </svg>
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
          </button>
        );
      })}

      {/* Custom service details input */}
      {isOtherSelected && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="text"
            value={customDetails}
            onChange={(e) => onCustomDetails(e.target.value)}
            placeholder="Describe what you're looking for..."
            disabled={disabled}
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200",
              "bg-[color:var(--surface)] text-[color:var(--text-strong)]",
              "border-[color:var(--border-subtle)] focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_0_4px_rgba(107,38,217,0.10)] focus:outline-none",
              "placeholder:text-[color:var(--text-faint)]",
              disabled && "cursor-not-allowed opacity-50"
            )}
            autoFocus
          />
          {customDetails.trim().length === 0 && (
            <p className="mt-1.5 px-1 text-xs text-[color:var(--text-faint)]">
              Please describe what you need so we can help you better.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
