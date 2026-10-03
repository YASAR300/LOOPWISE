"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export const RadioGroupItem = React.forwardRef(
  ({ className, label, description, id: providedId, ...props }, ref) => {
    const id =
      providedId ||
      (label ? `radio-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const radioNode = (
      <RadioGroupPrimitive.Item
        ref={ref}
        id={id}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-border-subtle bg-surface-raised text-accent transition-colors duration-fast focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent",
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2 w-2 fill-current text-accent" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );

    if (!label) return radioNode;

    return (
      <div className="flex select-none items-start gap-2">
        {radioNode}
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
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
