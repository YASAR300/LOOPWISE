import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "border-border-hairline/40 animate-pulse rounded border bg-surface-overlay",
        className
      )}
      {...props}
    />
  );
}
