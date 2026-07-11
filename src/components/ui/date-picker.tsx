"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<Date | undefined>(value);
  const selectedValue = value === undefined ? internalValue : value;

  const formattedValue = selectedValue
    ? selectedValue.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={selectedValue ? formatDateValue(selectedValue) : ""} />}
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
          selected={selectedValue as Date | Date[] | undefined}
          onSelect={(date) => {
            const nextDate = mode === "range" && Array.isArray(date) ? date[0] : date as Date;
            if (value === undefined) setInternalValue(nextDate);
            if (mode === "range" && Array.isArray(date)) {
              onChange?.(date[0]);
            } else {
              onChange?.(date as Date);
            }
            if (mode === "single") setOpen(false);
          }}
          disabled={disabledDates}
          minDate={minDate}
          maxDate={maxDate}
          fromToday={!!minDate}
          initialMonth={selectedValue || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
