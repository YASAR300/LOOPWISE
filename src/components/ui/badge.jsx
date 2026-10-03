import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  variant: {
    default: "bg-surface-overlay text-text-primary border-border-hairline",
    secondary: "bg-surface-raised text-text-secondary border-border-hairline",
    outline: "bg-transparent text-text-secondary border-border-subtle",
    accent: "bg-accent/10 text-accent border-accent/20",
    success:
      "bg-semantic-success/10 text-semantic-success border-semantic-success/20",
    warning:
      "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
    danger:
      "bg-semantic-danger/10 text-semantic-danger border-semantic-danger/20",
    info: "bg-semantic-info/10 text-semantic-info border-semantic-info/20",
  },
  size: {
    xs: "px-1.5 py-0.5 text-2xs leading-3 rounded",
    sm: "px-2 py-0.5 text-xs rounded-md",
    md: "px-2.5 py-1 text-xs rounded-md",
  },
};

export function Badge({
  className,
  variant = "default",
  size = "sm",
  dot = false,
  children,
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-1.5 border font-medium leading-none",
        badgeVariants.variant[variant] || badgeVariants.variant.default,
        badgeVariants.size[size] || badgeVariants.size.sm,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-semantic-success",
            variant === "warning" && "bg-semantic-warning",
            variant === "danger" && "bg-semantic-danger",
            variant === "info" && "bg-semantic-info",
            variant === "accent" && "bg-accent",
            (variant === "default" ||
              variant === "secondary" ||
              variant === "outline") &&
              "bg-text-secondary"
          )}
        />
      )}
      {children}
    </span>
  );
}
