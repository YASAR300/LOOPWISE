"use client";

import React from "react";
import { getStatusConfig } from "@/lib/status";

export function StatusPill({ status, label, className = "", showIcon = true }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex shrink-0 select-none items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-xs font-semibold leading-none ${config.className} ${className}`}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{displayLabel}</span>
    </span>
  );
}
