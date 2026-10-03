import * as React from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value = 0,
  max = 100,
  size = "md",
  color = "accent",
  showLabel = false,
  className = "",
}) {
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((value / max) * 100))
  );

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colorClasses = {
    accent: "bg-accent",
    success: "bg-semantic-success",
    warning: "bg-semantic-warning",
    danger: "bg-semantic-danger",
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between font-mono text-2xs text-text-secondary">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full border border-border-hairline bg-surface-overlay",
          sizeClasses[size] || sizeClasses.md
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            colorClasses[color] || colorClasses.accent
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
