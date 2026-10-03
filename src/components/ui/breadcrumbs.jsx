import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ items = [], className = "" }) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn(
        "flex items-center space-x-1.5 text-xs text-text-secondary",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.label || index}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-text-muted" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="max-w-[120px] truncate transition-colors hover:text-text-primary sm:max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "max-w-[150px] truncate sm:max-w-none",
                  isLast ? "font-medium text-text-primary" : ""
                )}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
