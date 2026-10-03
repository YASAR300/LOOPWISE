"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  isMulti = false,
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const isSelected = (val) => {
    if (isMulti) {
      return Array.isArray(value) && value.includes(val);
    }
    return value === val;
  };

  const handleSelect = (val) => {
    if (isMulti) {
      const current = Array.isArray(value) ? [...value] : [];
      const index = current.indexOf(val);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(val);
      }
      onChange?.(current);
    } else {
      onChange?.(val);
      setOpen(false);
    }
  };

  const handleRemove = (e, val) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange?.(value.filter((v) => v !== val));
    }
  };

  // Label display
  const getSelectedLabel = () => {
    if (isMulti) {
      if (!Array.isArray(value) || value.length === 0) return placeholder;
      return (
        <div className="flex max-w-[200px] flex-wrap gap-1 overflow-hidden">
          {value.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 rounded border border-border-hairline bg-surface-overlay px-1.5 py-0.5 text-2xs text-text-primary"
              >
                {opt ? opt.label : val}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-semantic-danger"
                  onClick={(e) => handleRemove(e, val)}
                />
              </span>
            );
          })}
        </div>
      );
    }

    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "flex min-h-8 w-full items-center justify-between rounded-md border border-border-hairline bg-surface-raised px-3 py-1.5 text-left text-sm text-text-primary shadow-inner-highlight transition-colors duration-fast hover:border-border-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className="truncate">{getSelectedLabel()}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[240px] animate-fade-in rounded-md border border-border-hairline bg-surface-overlay p-1 text-text-primary shadow-card"
        >
          <div className="flex items-center border-b border-border-hairline px-2 pb-1.5 pt-1">
            <Search className="mr-2 h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>

          <div className="max-h-56 overflow-y-auto pt-1">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-text-muted">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "flex cursor-pointer select-none items-center justify-between rounded px-2 py-1.5 text-xs transition-colors hover:bg-surface-highlight",
                    isSelected(opt.value) && "font-medium text-accent"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected(opt.value) && (
                    <Check className="h-3.5 w-3.5 text-accent" />
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
