"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(
    value ? new Date(value) : new Date()
  );

  const days = React.useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const handleSelectDay = (day) => {
    onChange?.(day);
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-md border border-border-hairline bg-surface-raised px-3 text-sm text-text-primary shadow-inner-highlight transition-colors hover:border-border-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-text-muted",
            className
          )}
        >
          <span className="truncate">
            {value ? format(new Date(value), "PPP") : placeholder}
          </span>
          <CalendarIcon className="ml-2 h-3.5 w-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-64 animate-fade-in select-none rounded-md border border-border-hairline bg-surface-overlay p-3 text-text-primary shadow-card"
        >
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="text-xs font-semibold">
              {format(viewDate, "MMMM yyyy")}
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-surface-highlight hover:text-text-primary"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-surface-highlight hover:text-text-primary"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-2 text-center text-2xs font-medium text-text-muted">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-1">
            {days.map((day) => {
              const isSelected = value && isSameDay(new Date(value), day);
              const isCurrent = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded text-xs transition-colors",
                    isSelected
                      ? "bg-accent font-semibold text-white"
                      : "text-text-primary hover:bg-surface-highlight",
                    !isSelected &&
                      isCurrent &&
                      "border border-accent font-medium text-accent"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
