"use client";

import React from "react";

export function Panel({ children, className = "", noPadding = false, id }) {
  return (
    <section
      id={id}
      className={`shadow-2xs rounded-[16px] border border-line bg-panel transition-all ${
        noPadding ? "" : "p-5 sm:p-6"
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  badge,
  actions,
  className = "",
}) {
  return (
    <div
      className={`mb-4 flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          {typeof title === "string" ? (
            <h2 className="font-sans text-base font-semibold tracking-tight text-ink">
              {title}
            </h2>
          ) : (
            title
          )}
          {badge}
        </div>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-2">
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
