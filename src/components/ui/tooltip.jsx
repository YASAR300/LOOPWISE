"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ children, ...props }) {
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 animate-fade-in select-none overflow-hidden rounded border border-border-hairline bg-surface-overlay px-2 py-1 text-2xs text-text-primary shadow-card",
        className
      )}
      {...props}
    />
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Convenient wrapper for tooltips
 */
export function SimpleTooltip({ content, children, side = "top" }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
