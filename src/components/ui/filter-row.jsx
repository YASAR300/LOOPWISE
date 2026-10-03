"use client";

import React, { useRef, useEffect } from "react";
import { Search, SlidersHorizontal, LayoutGrid, Rows } from "lucide-react";

export function FilterRow({
  search = "",
  onSearchChange,
  status = "all",
  onStatusChange,
  statusOptions = [],
  filter2 = "all",
  onFilter2Change = null,
  filter2Label = "All agents",
  filter2Options = [],
  savedViews = [],
  activeView = "all",
  onViewChange = null,
  density = "comfortable", // "comfortable" (48px) | "compact" (40px)
  onDensityChange = null,
  placeholder = "Search by name or description...",
  className = "",
}) {
  const inputRef = useRef(null);

  // Focus on "/" key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Saved View Tabs if provided */}
      {savedViews.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-line pb-1">
          {savedViews.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => onViewChange && onViewChange(view.id)}
              className={`shrink-0 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                activeView === view.id
                  ? "shadow-2xs border border-line bg-panel text-ink"
                  : "text-ink-2 hover:bg-panel-2 hover:text-ink"
              }`}
            >
              {view.label}
              {view.count !== undefined && (
                <span className="ml-1.5 font-mono text-[10px] text-ink-3">
                  {view.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Inputs and Selects Row */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 w-full rounded-lg border border-line bg-panel pl-8 pr-8 text-xs text-ink placeholder:text-ink-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-indigo"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none rounded border border-line bg-panel-2 px-1 font-mono text-[10px] text-ink-3">
            /
          </kbd>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-2">
          {/* Status Select */}
          {statusOptions.length > 0 && (
            <select
              value={status}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              className="h-8 rounded-lg border border-line bg-panel px-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              aria-label="Filter by status"
            >
              <option value="all">Any status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Secondary Filter Select */}
          {filter2Options.length > 0 && (
            <select
              value={filter2}
              onChange={(e) =>
                onFilter2Change && onFilter2Change(e.target.value)
              }
              className="h-8 rounded-lg border border-line bg-panel px-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              aria-label={filter2Label}
            >
              <option value="all">{filter2Label}</option>
              {filter2Options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Density Toggle */}
          {onDensityChange && (
            <div className="flex items-center rounded-lg border border-line bg-panel p-0.5">
              <button
                type="button"
                onClick={() => onDensityChange("comfortable")}
                title="Comfortable density (48px)"
                className={`rounded p-1 text-ink-3 transition-colors ${
                  density === "comfortable"
                    ? "shadow-2xs bg-panel-2 font-bold text-ink"
                    : "hover:text-ink"
                }`}
              >
                <Rows className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDensityChange("compact")}
                title="Compact density (40px)"
                className={`rounded p-1 text-ink-3 transition-colors ${
                  density === "compact"
                    ? "shadow-2xs bg-panel-2 font-bold text-ink"
                    : "hover:text-ink"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
