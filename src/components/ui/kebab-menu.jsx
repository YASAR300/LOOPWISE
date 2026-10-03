"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export function KebabMenu({ items = [], align = "right", className = "" }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div
      ref={menuRef}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="More options"
        className="rounded-md border border-transparent p-1 text-ink-3 transition-colors hover:border-line hover:bg-panel-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`shadow-warm animate-in fade-in zoom-in-95 absolute z-50 mt-1 min-w-[160px] rounded-lg border border-line bg-panel p-1 duration-100 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, idx) => {
            if (item.separator) {
              return <div key={idx} className="my-1 border-t border-line" />;
            }
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  item.onClick && item.onClick();
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                  item.destructive
                    ? "text-[#B42318] hover:bg-[#FFECEC] dark:text-[#F87171] dark:hover:bg-[#331515]"
                    : "text-ink hover:bg-panel-2 hover:text-ink"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="font-mono text-[10px] tracking-tighter text-ink-3">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
