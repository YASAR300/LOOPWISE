import * as React from "react";
import { cn } from "@/lib/utils";

export function Kbd({ children, className = "" }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 select-none items-center justify-center rounded border border-border-hairline bg-surface-overlay px-1.5 font-mono text-2xs font-semibold text-text-secondary shadow-sm",
        className
      )}
    >
      {children}
    </kbd>
  );
}
