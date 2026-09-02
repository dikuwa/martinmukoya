"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, ChangeEvent } from "react";

interface DashboardRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  className?: string;
  description?: string;
  onChange?: (value: string) => void;
}

export function DashboardRadio({
  label,
  className,
  description,
  checked,
  onChange,
  disabled,
  ...props
}: DashboardRadioProps) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onChange?.(value);
  };

  return (
    <label
      className={cn(
        "inline-flex items-start gap-3 cursor-pointer select-none",
        className
      )}
    >
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          type="radio"
          checked={checked}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn(
            "peer h-4 w-4 appearance-none rounded-full border-2 transition-colors",
            "border-[color:var(--border-subtle)]",
            "bg-[color:var(--surface)]",
            "checked:border-[color:var(--primary)]",
            "checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rounded-full checked:after:bg-[color:var(--primary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[color:var(--surface-soft)]"
          )}
          {...props}
        />
      </span>
      <div>
        {label && <span className="text-sm font-semibold text-[color:var(--text-strong)] peer-disabled:text-[color:var(--text-muted)]">{label}</span>}
        {description && <p className="text-xs text-[color:var(--text-muted)]">{description}</p>}
      </div>
    </label>
  );
}

interface DashboardRadioGroupProps {
  name: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
  required?: boolean;
}

export function DashboardRadioGroup({
  name,
  options,
  value,
  onChange,
  className,
  disabled,
  direction = "vertical",
  required,
}: DashboardRadioGroupProps) {
  const handleChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  return (
    <fieldset className={cn("grid gap-2", direction === "horizontal" && "flex flex-wrap", className)}>
      <legend className="text-sm font-bold text-[color:var(--text-strong)]">{name}</legend>
      <div className={cn("flex flex-wrap gap-5", direction === "vertical" && "flex-col")}>
        {options.map((option) => (
          <DashboardRadio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            disabled={disabled}
            required={required}
          />
        ))}
      </div>
    </fieldset>
  );
}