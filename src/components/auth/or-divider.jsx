import React from "react";

export function OrDivider({ label = "or" }) {
  return (
    <div className="relative my-1 flex select-none items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-line" />
      </div>
      <span className="relative bg-panel px-3 font-mono text-[11px] uppercase tracking-wider text-ink-3">
        {label}
      </span>
    </div>
  );
}
