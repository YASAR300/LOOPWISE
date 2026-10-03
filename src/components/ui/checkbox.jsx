"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef(
  ({ className, label, description, ...props }, ref) => {
    const id =
      props.id ||
      (label ? `cb-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const checkboxNode = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={id}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded border border-border-subtle bg-surface-raised shadow-inner-highlight transition-colors duration-fast focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3 w-3 stroke-[2.5]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label) return checkboxNode;

    return (
      <div className="flex select-none items-start gap-2">
        {checkboxNode}
        <div className="grid gap-0.5 leading-none">
          <label
            htmlFor={id}
            className="cursor-pointer text-xs font-medium leading-4 text-text-primary"
          >
            {label}
          </label>
          {description && (
            <p className="text-2xs leading-4 text-text-muted">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
