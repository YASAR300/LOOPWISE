"use client";

import React, { useEffect } from "react";
import { X, Command } from "lucide-react";

const SHORTCUT_GROUPS = [
  {
    category: "General",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["["], description: "Toggle left sidebar" },
      { keys: ["/"], description: "Focus search / filter" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close modal / drawer" },
    ],
  },
  {
    category: "Navigation Chords",
    shortcuts: [
      { keys: ["G", "H"], description: "Go to Home dashboard" },
      { keys: ["G", "E"], description: "Go to Engagements" },
      { keys: ["G", "A"], description: "Go to Agents fleet" },
      { keys: ["G", "B"], description: "Go to Briefs" },
      { keys: ["G", "S"], description: "Go to Settings" },
    ],
  },
  {
    category: "Lists & Tables",
    shortcuts: [
      { keys: ["J"], description: "Next row" },
      { keys: ["K"], description: "Previous row" },
      { keys: ["Enter"], description: "Open selected row" },
      { keys: ["X"], description: "Select row checkbox" },
      { keys: ["C"], description: "Create new item" },
    ],
  },
];

export function ShortcutSheet({ open = false, onClose }) {
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
    <div className="bg-ink/40 backdrop-blur-xs animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/70">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="shadow-warm relative w-full max-w-lg space-y-6 rounded-2xl border border-line bg-panel p-6 text-ink"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5 text-brand-indigo" />
            <h3
              id="shortcuts-title"
              className="font-sans text-base font-bold text-ink"
            >
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
            aria-label="Close shortcuts modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h4 className="text-2xs font-bold uppercase tracking-wider text-ink-3">
                {group.category}
              </h4>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-panel-2"
                  >
                    <span className="text-ink-2">{sc.description}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="shadow-2xs rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
