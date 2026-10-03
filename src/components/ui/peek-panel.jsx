"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export function PeekPanel({
  open = false,
  onClose,
  title = "Details",
  badge = null,
  actions = null,
  children,
  width = "max-w-xl",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose && onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 overflow-hidden duration-150">
      {/* Backdrop */}
      <div
        className="bg-ink/30 backdrop-blur-xs absolute inset-0 transition-opacity dark:bg-black/60"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-screen ${width} shadow-warm animate-in slide-in-from-right flex flex-col border-l border-line bg-panel transition-all duration-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line bg-panel-2 px-6 py-4">
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-base font-semibold tracking-tight text-ink">
                {title}
              </h3>
              {badge}
            </div>

            <div className="flex items-center gap-2">
              {actions}
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-ink-3 transition-colors hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
