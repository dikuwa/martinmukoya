"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  eachDayOfInterval,
} from "date-fns";

interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | Date[] | undefined;
  onSelect: (date: Date | Date[]) => void;
  disabled?: Date[];
  minDate?: Date;
  maxDate?: Date;
  fromToday?: boolean;
  className?: string;
  initialMonth?: Date;
  numberOfMonths?: number;
  showWeekNumbers?: boolean;
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled = [],
  minDate,
  maxDate,
  fromToday = false,
  className,
  initialMonth = new Date(),
  numberOfMonths = 1,
  showWeekNumbers = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const months = Array.from({ length: numberOfMonths }, (_, i) =>
    addMonths(currentMonth, i)
  );

  const isDateDisabled = (date: Date) => {
    if (fromToday && isBefore(date, new Date())) return true;
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
    return disabled.some((d) => isSameDay(d, date));
  };

  const isDateSelected = (date: Date) => {
    if (!selected) return false;
    if (mode === "single") return isSameDay(selected as Date, date);
    if (mode === "range" && Array.isArray(selected)) {
      const [start, end] = selected;
      if (!start || !end) return isSameDay(start, date);
      return (
        isSameDay(start, date) ||
        isSameDay(end, date) ||
        (isAfter(date, start) && isBefore(date, end))
      );
    }
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (mode !== "range" || !Array.isArray(selected)) return false;
    const [start, end] = selected;
    if (!start || !end) return false;
    return isAfter(date, start) && isBefore(date, end);
  };

  const handleDayClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (mode === "single") {
      onSelect(date);
    } else if (mode === "range") {
      const selectedArray = (selected as Date[]) || [];
      if (selectedArray.length === 0 || selectedArray.length === 2) {
        onSelect([date]);
      } else if (selectedArray.length === 1) {
        const newRange = [selectedArray[0], date].sort((a, b) => a.getTime() - b.getTime());
        onSelect(newRange);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    if (isDateDisabled(date)) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleDayClick(date);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusDate(addDays(date, -1));
        break;
      case "ArrowRight":
        event.preventDefault();
        focusDate(addDays(date, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        focusDate(addDays(date, -7));
        break;
      case "ArrowDown":
        event.preventDefault();
        focusDate(addDays(date, 7));
        break;
      case "Home":
        event.preventDefault();
        focusDate(startOfWeek(date));
        break;
      case "End":
        event.preventDefault();
        focusDate(endOfWeek(date));
        break;
      case "PageUp":
        event.preventDefault();
        setCurrentMonth((m) => subMonths(m, 1));
        break;
      case "PageDown":
        event.preventDefault();
        setCurrentMonth((m) => addMonths(m, 1));
        break;
    }
  };

  const [focusedDate, setFocusedDate] = useState<Date>(selected as Date || new Date());

  const focusDate = (date: Date) => {
    if (!isDateDisabled(date)) {
      setFocusedDate(date);
    }
  };

  return (
    <div
      className={cn(
        "dashboard-calendar flex flex-col gap-4",
        numberOfMonths > 1 && "md:flex-row",
        className
      )}
      role="grid"
      aria-label="Calendar"
    >
      {months.map((month, index) => (
        <div key={month.toISOString()} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {numberOfMonths === 1 && (
              <>
                <button
                  type="button"
                  className="p-1 rounded-[6px] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
                  onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold text-[color:var(--text-strong)]">
                  {format(month, "MMMM yyyy")}
                </span>
                <button
                  type="button"
                  className="p-1 rounded-[6px] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
                  onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
            {numberOfMonths > 1 && index === 0 && (
              <button
                type="button"
                className="p-1 rounded-[6px] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {numberOfMonths > 1 && index === numberOfMonths - 1 && (
              <button
                type="button"
                className="p-1 rounded-[6px] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            )}
            {numberOfMonths > 1 && (
              <span className="font-semibold text-[color:var(--text-strong)]">
                {format(month, "MMMM yyyy")}
              </span>
            )}
          </div>
          <table className="dashboard-calendar-table w-full border-collapse" role="grid">
            <thead>
              <tr className="text-[color:var(--text-faint)] text-xs font-semibold">
                {showWeekNumbers && <th className="p-1" aria-label="Week" />}
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <th key={day} className="p-1 text-center">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getCalendarWeeks(month).map((week) => (
                <tr key={`${week[0].toISOString()}-row`}>
                  {showWeekNumbers && (
                    <td className="p-1 text-center text-xs text-[color:var(--text-faint)]">
                      {getWeekNumber(week[0])}
                    </td>
                  )}
                  {week.map((day) => {
                    const isCurrentMonth = isSameMonth(day, month);
                    const isSelectedDay = isDateSelected(day);
                    const isInRange = isDateInRange(day);
                    const disabled = isDateDisabled(day);
                    const isFocused = focusedDate ? isSameDay(focusedDate, day) : false;

                    return (
                      <td key={day.toISOString()} className="p-1" aria-selected={isSelectedDay}>
                        <button
                          type="button"
                          className={cn(
                            "dashboard-calendar-day w-full h-9 rounded-[6px] text-sm font-medium transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]",
                            !isCurrentMonth && "text-[color:var(--text-faint)]",
                            isSelectedDay && "bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-light)]",
                            isInRange && "bg-[color:var(--primary)]/10 text-[color:var(--primary)]",
                            isToday(day) && "ring-2 ring-[color:var(--primary)] ring-offset-2 ring-offset-[color:var(--background)]",
                            disabled && "opacity-50 cursor-not-allowed",
                            isFocused && "ring-2 ring-[color:var(--primary)] ring-offset-2 ring-offset-[color:var(--background)]"
                          )}
                          onClick={() => handleDayClick(day)}
                          onKeyDown={(e) => handleKeyDown(e, day)}
                          disabled={disabled}
                          aria-current={isToday(day) ? "date" : undefined}
                          aria-disabled={disabled}
                          aria-label={format(day, "EEEE, MMMM d, yyyy")}
                          tabIndex={isFocused || isSelectedDay ? 0 : -1}
                        >
                          {format(day, "d")}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export function getCalendarWeeks(month: Date) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
  });

  return Array.from({ length: days.length / 7 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7)
  );
}

function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}
