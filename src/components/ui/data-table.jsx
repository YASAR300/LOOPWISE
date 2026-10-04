"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IdentityTile } from "./identity-tile";
import { ToolChipRow } from "./tool-chip";
import { StatusPill } from "./status-pill";
import { KebabMenu } from "./kebab-menu";
import { Checkbox } from "./checkbox";
import { PeekPanel } from "./peek-panel";
import { toast } from "./toast";
import {
  ExternalLink,
  Pause,
  Play,
  Trash2,
  CheckSquare,
  X,
  Download,
  AlertCircle,
} from "lucide-react";

export function DataTable({
  columns = null,
  data = [],
  density = "comfortable", // "comfortable" (48px) | "compact" (40px)
  onRowClick = null,
  onToolClick = null,
  emptyMessage = "No activity records found.",
  enableSelection = true,
  enablePeek = true,
  onStatusChange = null,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [peekItem, setPeekItem] = useState(null);

  const rowHeightClass =
    density === "compact" ? "h-10 text-xs" : "h-12 text-xs";

  // Toggle single item
  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle all items
  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((d) => d.id)));
    }
  };

  // Keyboard navigation: J/K, Enter, X
  const handleKeyDown = useCallback(
    (e) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (
        e.key === "x" &&
        focusedIndex >= 0 &&
        focusedIndex < data.length
      ) {
        e.preventDefault();
        const currentItem = data[focusedIndex];
        if (currentItem) toggleSelect(currentItem.id);
      } else if (
        e.key === "Enter" &&
        focusedIndex >= 0 &&
        focusedIndex < data.length
      ) {
        e.preventDefault();
        const currentItem = data[focusedIndex];
        if (currentItem) {
          if (currentItem.href) {
            window.location.href = currentItem.href;
          } else {
            setPeekItem(currentItem);
          }
        }
      } else if (
        e.key === " " &&
        focusedIndex >= 0 &&
        focusedIndex < data.length
      ) {
        e.preventDefault();
        const currentItem = data[focusedIndex];
        if (currentItem) setPeekItem(currentItem);
      }
    },
    [data, focusedIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleRowClick = (item, e) => {
    if (onRowClick) {
      onRowClick(item);
    } else if (enablePeek) {
      setPeekItem(item);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-ink-3">{emptyMessage}</div>
    );
  }

  return (
    <div className="relative w-full select-none overflow-x-auto">
      <table className="w-full border-collapse text-left">
        {/* Tinted Table Header */}
        <thead>
          <tr className="h-9 border-b border-line bg-panel-2 text-xs font-medium text-ink-3">
            {enableSelection && (
              <th className="w-10 px-3 text-center">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all rows"
                  className="h-3.5 w-3.5 cursor-pointer rounded border-line text-brand-indigo accent-[#4B3FD6] focus:ring-brand-indigo"
                />
              </th>
            )}
            <th className="min-w-[180px] px-3 text-xs font-medium text-ink-3 md:min-w-[220px]">
              Agent / Item
            </th>
            <th className="min-w-[220px] px-3 text-xs font-medium text-ink-3">
              Description
            </th>
            <th className="w-28 px-3 text-xs font-medium text-ink-3">Date</th>
            <th className="w-44 px-3 text-xs font-medium text-ink-3">
              Apps used
            </th>
            <th className="w-28 px-3 text-xs font-medium text-ink-3">Status</th>
            <th className="w-12 px-2 text-right"></th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-line">
          {data.map((item, index) => {
            const isSelected = selectedIds.has(item.id);
            const isFocused = focusedIndex === index;

            const kebabItems = [
              {
                label: "Inspect details",
                icon: ExternalLink,
                onClick: () => setPeekItem(item),
              },
              {
                label: item.status === "paused" ? "Resume" : "Pause",
                icon: item.status === "paused" ? Play : Pause,
                onClick: () => {
                  toast.success(
                    `Updated status for ${item.name || item.title}`
                  );
                  if (onStatusChange)
                    onStatusChange(
                      item.id,
                      item.status === "paused" ? "in-progress" : "paused"
                    );
                },
              },
              { separator: true },
              {
                label: "Delete record",
                icon: Trash2,
                destructive: true,
                onClick: () => {
                  toast.error(`Removed record: ${item.name || item.title}`);
                },
              },
            ];

            return (
              <tr
                key={item.id || index}
                onClick={(e) => handleRowClick(item, e)}
                className={`group cursor-pointer transition-colors ${rowHeightClass} ${
                  isSelected
                    ? "bg-brand-indigo/5 dark:bg-brand-indigo/10"
                    : isFocused
                      ? "ring-brand-indigo/30 bg-panel-2 ring-1 ring-inset"
                      : "hover:bg-panel-2"
                }`}
              >
                {/* Selection Checkbox */}
                {enableSelection && (
                  <td
                    className="w-10 px-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelect(item.id, e)}
                      aria-label={`Select ${item.name || item.title}`}
                      className={`h-3.5 w-3.5 cursor-pointer rounded border-line accent-[#4B3FD6] focus:ring-brand-indigo ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      } transition-opacity`}
                    />
                  </td>
                )}

                {/* Identity Tile + Name */}
                <td className="min-w-[180px] px-3 md:min-w-[220px]">
                  <div className="flex items-center gap-2.5">
                    <IdentityTile
                      name={item.name || item.title}
                      id={item.id}
                      size="sm"
                    />
                    <span className="max-w-[200px] truncate font-semibold text-ink transition-colors group-hover:text-brand-indigo md:max-w-[260px]">
                      {item.name || item.title}
                    </span>
                  </div>
                </td>

                {/* Description */}
                <td className="min-w-[220px] px-3 text-ink-2">
                  <span className="line-clamp-1 text-xs">
                    {item.description || "—"}
                  </span>
                </td>

                {/* Date */}
                <td className="whitespace-nowrap px-3 text-xs text-ink-3">
                  {item.date || item.createdAt || "Today at 8am"}
                </td>

                {/* Apps used (Tool Chips) */}
                <td
                  className="whitespace-nowrap px-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ToolChipRow
                    tools={item.tools || item.apps || []}
                    onToolClick={onToolClick}
                    size="sm"
                    limit={2}
                    max={2}
                  />
                </td>

                {/* Status Pill */}
                <td className="whitespace-nowrap px-3">
                  <StatusPill status={item.status || "complete"} />
                </td>

                {/* Kebab Menu */}
                <td
                  className="w-12 px-2 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <KebabMenu items={kebabItems} align="right" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="shadow-warm animate-in fade-in slide-in-from-bottom-2 sticky bottom-4 left-1/2 z-40 mx-auto flex w-max -translate-x-1/2 items-center gap-3 rounded-xl border border-line-2 bg-[#1B1A17] px-4 py-2 text-white duration-150 dark:bg-[#1C1A16]">
          <span className="text-xs font-semibold">
            {selectedIds.size} row{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="h-4 w-px bg-white/20" />
          <button
            type="button"
            onClick={() => {
              toast.success(`Exported ${selectedIds.size} records to CSV`);
            }}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors hover:text-brand-accent"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              toast.info(`Paused ${selectedIds.size} selected items`);
            }}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors hover:text-amber-400"
          >
            <Pause className="h-3.5 w-3.5" />
            <span>Pause</span>
          </button>
          <button
            type="button"
            onClick={() => {
              toast.error(`Archived ${selectedIds.size} selected items`);
              setSelectedIds(new Set());
            }}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-2 text-ink-3 transition-colors hover:text-white"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Peek Panel (Slide-out Right Drawer) */}
      {peekItem && (
        <PeekPanel
          isOpen={Boolean(peekItem)}
          onClose={() => setPeekItem(null)}
          title={peekItem.name || peekItem.title}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <IdentityTile
                name={peekItem.name || peekItem.title}
                id={peekItem.id}
                size="lg"
              />
              <div>
                <h4 className="text-sm font-semibold text-ink">
                  {peekItem.name || peekItem.title}
                </h4>
                <p className="text-xs text-ink-3">ID: {peekItem.id}</p>
              </div>
            </div>

            <div className="space-y-3 border-y border-line py-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-3">Status</span>
                <StatusPill status={peekItem.status || "complete"} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-3">Timestamp</span>
                <span className="font-mono text-ink">
                  {peekItem.date || peekItem.createdAt || "Today at 8:00 AM"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-3">Integrations</span>
                <ToolChipRow
                  tools={peekItem.tools || peekItem.apps || []}
                  size="sm"
                  max={4}
                />
              </div>
            </div>

            <div>
              <h5 className="mb-1.5 text-xs font-semibold text-ink">
                Full Description & Payload
              </h5>
              <div className="rounded-lg border border-line bg-panel-2 p-3 text-xs leading-relaxed text-ink-2">
                {peekItem.description ||
                  "No extended execution logs available for this automation event."}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (peekItem.href) {
                    window.location.href = peekItem.href;
                  } else {
                    toast.info(
                      `Opening details for ${peekItem.name || peekItem.title}`
                    );
                  }
                }}
                className="btn-primary-indigo flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open full record (Enter)</span>
              </button>
            </div>
          </div>
        </PeekPanel>
      )}
    </div>
  );
}
