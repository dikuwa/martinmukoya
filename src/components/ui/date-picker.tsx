"use client";

import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DashboardDatePickerProps {
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
  mode?: "single" | "range";
}

export function DashboardDatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Select date",
  minDate,
  maxDate,
  disabledDates = [],
  className,
  mode = "single",
}: DashboardDatePickerProps) {
  const formattedValue = value
    ? value.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-sm font-normal",
            !value && "text-[color:var(--text-faint)]",
            className
          )}
          disabled={disabled}
          aria-label={placeholder}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[color:var(--text-muted)]" aria-hidden="true" />
          {formattedValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={5}>
        <Calendar
          mode={mode}
          selected={value as Date | Date[] | undefined}
          onSelect={(date) => {
            if (mode === "range" && Array.isArray(date)) {
              onChange?.(date[0]);
            } else {
              onChange?.(date as Date);
            }
          }}
          disabled={disabledDates}
          minDate={minDate}
          maxDate={maxDate}
          fromToday={!!minDate}
          initialMonth={value || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}