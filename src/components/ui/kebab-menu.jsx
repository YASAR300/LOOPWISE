"use client";

import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";

export function KebabMenu({ items = [], align = "right", className = "" }) {
  const alignOption = align === "right" ? "end" : "start";

  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="More options"
          onClick={(e) => e.stopPropagation()}
          className={`rounded-md border border-transparent p-1 text-ink-3 transition-colors hover:border-line hover:bg-panel-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo ${className}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={alignOption}
          side="bottom"
          sideOffset={4}
          avoidCollisions={true}
          collisionPadding={12}
          onClick={(e) => e.stopPropagation()}
          className="shadow-warm animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 z-50 min-w-[170px] overflow-hidden rounded-xl border border-line bg-panel p-1 text-ink"
        >
          {items.map((item, idx) => {
            if (item.separator) {
              return (
                <DropdownMenuPrimitive.Separator
                  key={idx}
                  className="my-1 border-t border-line"
                />
              );
            }

            const Icon = item.icon;

            return (
              <DropdownMenuPrimitive.Item
                key={idx}
                disabled={item.disabled}
                onSelect={(e) => {
                  if (item.onClick) {
                    item.onClick(e);
                  }
                }}
                className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors ${
                  item.destructive
                    ? "text-[#B42318] focus:bg-[#FFECEC] focus:text-[#B42318] dark:text-[#F87171] dark:focus:bg-[#331515]"
                    : "text-ink focus:bg-panel-2 focus:text-ink"
                } data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40`}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="ml-3 font-mono text-[10px] tracking-tight text-ink-3">
                    {item.shortcut}
                  </span>
                )}
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
