"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ChangeEvent } from "react";

type DashboardRadioItemProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  description?: string;
  value: string;
  onSelect?: (value: string) => void;
};

type DashboardRadioGroupProps = {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  required?: boolean;
  label?: string;
  description?: string;
};

export function DashboardRadioGroup({
  name,
  value,
  onChange,
  children,
  className,
  disabled,
  orientation = "vertical",
  required,
  label,
  description,
}: DashboardRadioGroupProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <fieldset
      className={cn(
        "grid gap-3",
        orientation === "horizontal" && "md:flex md:items-center md:gap-5",
        className
      )}
    >
      {(label || description) && (
        <div className="grid gap-1 text-sm font-bold text-[color:var(--text-strong)]">
          {label && <legend>{label}</legend>}
          {description && (
            <span className="text-xs font-normal text-[color:var(--text-muted)]">
              {description}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "grid gap-2",
          orientation === "horizontal" && "md:flex md:items-center md:gap-5"
        )}
        role="radiogroup"
        aria-required={required}
        aria-disabled={disabled}
      >
        {childrenArray.map((child, index) => {
          if (!React.isValidElement(child)) return child;
          const childProps = child.props as DashboardRadioItemProps;
          return React.cloneElement(child as React.ReactElement<any>, {
            key: child.key ?? index,
            name,
            value,
            onSelect: handleChange,
            disabled: disabled ?? childProps.disabled,
          });
        })}
      </div>
    </fieldset>
  );
}

DashboardRadioGroup.displayName = "DashboardRadioGroup";

export function DashboardRadioItem({
  label,
  description,
  value,
  disabled,
  className,
  name,
  onSelect,
  value: _value,
  ...props
}: DashboardRadioItemProps) {
  const isSelected = value === _value;

  return (
    <label
      className={cn(
        "inline-flex items-start gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative flex shrink-0">
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          onChange={() => onSelect?.(value)}
          disabled={disabled}
          className="sr-only peer"
          required={props.required}
          aria-describedby={description ? `${name}-${value}-desc` : undefined}
          {...props}
        />
        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-200",
            "border-[color:var(--border-subtle)] bg-[color:var(--surface)]",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--background)]",
            "peer-hover:border-[color:var(--primary)]/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isSelected &&
              "border-[color:var(--primary)] bg-[color:var(--primary)]",
            className
          )}
          aria-hidden="true"
        >
          {isSelected && (
            <span
              className="flex h-2 w-2 rounded-full bg-white"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
      <div className="grid gap-0.5 text-sm font-bold text-[color:var(--text-strong)]">
        <span>{label}</span>
        {description && (
          <span
            id={`${name}-${value}-desc`}
            className="text-xs font-normal text-[color:var(--text-muted)]"
          >
            {description}
          </span>
        )}
      </div>
    </label>
  );
}

DashboardRadioGroup.displayName = "DashboardRadioGroup";
DashboardRadioItem.displayName = "DashboardRadioItem";