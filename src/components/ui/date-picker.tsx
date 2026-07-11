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
  name?: string;
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
  name,
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
      {name && <input type="hidden" name={name} value={value?.toISOString().split("T")[0] || ""} />}
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-sm",
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
      <PopoverContent
        className="w-[320px] max-w-[calc(100vw-2rem)] p-3"
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
      >
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
