"use client";

import React from "react";
import Link from "next/link";

export function PlanUsageMeter({
  planName = "Enterprise Plan",
  used = 320,
  total = 10000,
  unit = "Activities",
  manageHref = "/app/billing",
  collapsed = false,
}) {
  const percentage = Math.min(100, Math.round((used / total) * 100));
  const strokeDashoffset = 100 - percentage;

  if (collapsed) {
    return (
      <Link
        href={manageHref}
        title={`${planName}: ${used.toLocaleString()}/${total.toLocaleString()} ${unit} (${percentage}%)`}
        className="flex items-center justify-center rounded-lg p-2 text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
      >
        <svg className="h-6 w-6 -rotate-90 transform" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            className="stroke-line"
            strokeWidth="3.5"
            fill="none"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            className="stroke-brand-indigo transition-all duration-300"
            strokeWidth="3.5"
            strokeDasharray="100"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </Link>
    );
  }

  return (
    <div className="bg-panel-2/70 space-y-2.5 rounded-xl border border-line p-3 text-ink">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink">{planName}</span>
        <Link
          href={manageHref}
          className="text-2xs font-semibold text-brand-indigo hover:underline"
        >
          Manage
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 shrink-0">
          <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="14"
              className="stroke-line"
              strokeWidth="3.5"
              fill="none"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              className="stroke-brand-indigo transition-all duration-500"
              strokeWidth="3.5"
              strokeDasharray="100"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-ink">
            {percentage}%
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-2xs font-medium">
            <span className="truncate text-ink-2">{unit}</span>
            <span className="font-mono font-bold text-ink">
              {used.toLocaleString()}/{total.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-1 rounded-full bg-brand-indigo transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
