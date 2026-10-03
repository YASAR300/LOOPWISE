"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(
  ({ className, type = "text", error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {leftIcon && (
          <div className="pointer-events-none absolute left-2.5 flex items-center text-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            "h-8 w-full rounded-md border border-border-hairline bg-surface-raised px-3 text-sm text-text-primary shadow-inner-highlight transition-colors duration-fast placeholder:text-text-muted focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-8",
            rightIcon && "pr-8",
            error &&
              "border-semantic-danger focus-visible:border-semantic-danger focus-visible:ring-semantic-danger",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="pointer-events-none absolute right-2.5 flex items-center text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
