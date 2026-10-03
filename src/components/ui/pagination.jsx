"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn(
        "flex select-none items-center justify-center space-x-1",
        className
      )}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-border-hairline bg-surface-raised text-text-secondary hover:bg-surface-overlay hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {getPageNumbers().map((page, idx) => {
        if (page === "...") {
          return (
            <span
              key={`dots-${idx}`}
              className="flex h-7 w-7 items-center justify-center text-text-muted"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-accent text-white"
                : "border border-border-hairline bg-surface-raised text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-border-hairline bg-surface-raised text-text-secondary hover:bg-surface-overlay hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
