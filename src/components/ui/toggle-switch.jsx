"use client";

import React from "react";

export function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  ariaLabel = "Toggle switch",
  className = "",
}) {
  const isSm = size === "sm";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      className={`duration-160 relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-50 ${
        isSm ? "h-4 w-7" : "h-5 w-9"
      } ${
        checked
          ? "bg-[#1E7A3C] dark:bg-[#4ADE80]"
          : "bg-[#D6CFC0] dark:bg-[#3C372C]"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`shadow-xs duration-160 pointer-events-none inline-block transform rounded-full bg-white transition-transform ease-out ${
          isSm ? "ml-0.5 mt-0.5 h-3 w-3" : "ml-0.5 mt-0.5 h-4 w-4"
        } ${
          checked ? (isSm ? "translate-x-3" : "translate-x-4") : "translate-x-0"
        }`}
      />
    </button>
  );
}
