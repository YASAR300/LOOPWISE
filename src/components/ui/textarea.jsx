"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef(
  ({ className, error, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "w-full resize-y rounded-md border border-border-hairline bg-surface-raised px-3 py-2 text-sm text-text-primary shadow-inner-highlight transition-colors duration-fast placeholder:text-text-muted focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
          error &&
            "border-semantic-danger focus-visible:border-semantic-danger focus-visible:ring-semantic-danger",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
