"use client";

import React from "react";

export function GroupedSection({
  title,
  count = null,
  actions = null,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Group Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-sm font-semibold tracking-tight text-ink">
            {title}
          </h3>
          {count !== null && (
            <span className="rounded-full border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-2xs font-bold text-ink-3">
              {count}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Group Content (e.g. Table Container) */}
      <div className="shadow-2xs overflow-hidden rounded-[14px] border border-line bg-panel">
        {children}
      </div>
    </div>
  );
}
