"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    primary:
      "bg-accent text-white hover:bg-accent-hover shadow-sm border border-transparent focus-visible:ring-accent",
    secondary:
      "bg-surface-raised text-text-primary border border-border-hairline hover:bg-surface-overlay hover:border-border-subtle focus-visible:ring-accent shadow-inner-highlight",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-highlight border border-transparent focus-visible:ring-accent",
    danger:
      "bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20 hover:bg-semantic-danger/20 focus-visible:ring-semantic-danger",
    outline:
      "bg-transparent text-text-primary border border-border-subtle hover:bg-surface-highlight hover:border-border-strong focus-visible:ring-accent",
    icon: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-highlight border border-transparent focus-visible:ring-accent p-0",
  },
  size: {
    xs: "h-6 px-2 text-2xs gap-1.5 rounded",
    sm: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
    md: "h-8 px-3 text-sm gap-2 rounded-md",
    lg: "h-9 px-4 text-base gap-2 rounded-md",
    icon: "h-8 w-8 rounded-md",
    "icon-sm": "h-7 w-7 rounded-md",
  },
};

export const Button = forwardRef(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      asChild = false,
      isLoading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const variantClass =
      buttonVariants.variant[variant] || buttonVariants.variant.secondary;
    const sizeClass =
      size === "icon" || size === "icon-sm"
        ? buttonVariants.size[size]
        : buttonVariants.size[size] || buttonVariants.size.md;

    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex cursor-pointer select-none items-center justify-center font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          variantClass,
          sizeClass,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {size !== "icon" && size !== "icon-sm" && <span>{children}</span>}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";
