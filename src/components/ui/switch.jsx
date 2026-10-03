"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef(
  ({ className, label, description, ...props }, ref) => {
    const id =
      props.id ||
      (label ? `sw-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const switchNode = (
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border border-border-hairline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-overlay",
          className
        )}
        id={id}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-3 w-3 rounded-full bg-white shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0.5"
          )}
        />
      </SwitchPrimitives.Root>
    );

    if (!label) return switchNode;

    return (
      <div className="flex items-center justify-between gap-3">
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
        {switchNode}
      </div>
    );
  }
);
Switch.displayName = SwitchPrimitives.Root.displayName;
