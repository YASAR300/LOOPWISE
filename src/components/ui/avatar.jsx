"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  xs: "h-5 w-5 text-2xs",
  sm: "h-6 w-6 text-2xs",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-14 w-14 text-base",
};

export const Avatar = React.forwardRef(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 select-none overflow-hidden rounded-full border border-border-hairline bg-surface-overlay",
          sizeClasses[size] || sizeClasses.md,
          className
        )}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-surface-raised font-medium text-text-secondary">
          {fallback || alt?.substring(0, 2)?.toUpperCase() || "LW"}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);
Avatar.displayName = "Avatar";

export function AvatarGroup({ children, max = 4, className = "" }) {
  const childArray = React.Children.toArray(children);
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visible.map((child, i) => (
        <div key={i} className="rounded-full ring-2 ring-background">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border-hairline bg-surface-raised text-2xs font-medium text-text-secondary ring-2 ring-background">
          +{remaining}
        </div>
      )}
    </div>
  );
}
