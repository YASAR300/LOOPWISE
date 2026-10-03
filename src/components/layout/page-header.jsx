import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className = "",
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-border-hairline pb-6 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          {badge && <div>{badge}</div>}
        </div>
        {description && (
          <p className="max-w-2xl text-xs leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function ContentContainer({
  children,
  className = "",
  size = "default",
}) {
  const maxSizes = {
    narrow: "max-w-4xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
    full: "max-w-none",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6",
        maxSizes[size] || maxSizes.default,
        className
      )}
    >
      {children}
    </div>
  );
}
