"use client";

import React from "react";

const PALETTE = [
  {
    name: "violet",
    bg: "bg-[#A9A4F0]",
    text: "text-[#2B1330]",
    border: "border-[#9690E8]",
  },
  {
    name: "mint",
    bg: "bg-[#9BE59B]",
    text: "text-[#14381C]",
    border: "border-[#85DB85]",
  },
  {
    name: "coral",
    bg: "bg-[#EC6B4F]",
    text: "text-white",
    border: "border-[#E2593B]",
  },
  {
    name: "sun",
    bg: "bg-[#F7C35A]",
    text: "text-[#4A380B]",
    border: "border-[#EDB440]",
  },
  {
    name: "pink",
    bg: "bg-[#F27BB3]",
    text: "text-white",
    border: "border-[#E563A2]",
  },
  {
    name: "teal",
    bg: "bg-[#3FB28F]",
    text: "text-white",
    border: "border-[#349E7E]",
  },
];

/**
 * Deterministic color index from string ID or name
 */
function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % PALETTE.length;
}

export function IdentityTile({
  id = "",
  label = "",
  glyph = null,
  colorIndex = null,
  size = "md", // "sm" (22px), "md" (26px), "lg" (32px)
  className = "",
}) {
  const idx =
    typeof colorIndex === "number"
      ? colorIndex % PALETTE.length
      : hashString(id || label);
  const color = PALETTE[idx];

  const sizeClasses =
    {
      sm: "h-[22px] w-[22px] text-[11px] rounded-[5px]",
      md: "h-[26px] w-[26px] text-xs rounded-[6px]",
      lg: "h-[32px] w-[32px] text-sm rounded-[7px]",
    }[size] || "h-[26px] w-[26px] text-xs rounded-[6px]";

  const char = label
    ? label.charAt(0).toUpperCase()
    : id
      ? id.charAt(0).toUpperCase()
      : "A";

  return (
    <div
      aria-hidden="true"
      className={`shadow-2xs inline-flex shrink-0 select-none items-center justify-center border font-mono font-bold tracking-tight ${color.bg} ${color.text} ${color.border} ${sizeClasses} ${className}`}
    >
      {glyph || char}
    </div>
  );
}
