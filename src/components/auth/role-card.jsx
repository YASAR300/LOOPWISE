"use client";

import React, { useRef } from "react";
import { Briefcase, Sparkles, Check } from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";

export function RoleCard({
  value,
  title,
  description,
  icon: Icon,
  selected = false,
  onClick,
  onKeyDown,
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={selected ? 0 : -1}
      className={`duration-160 group relative flex cursor-pointer select-none flex-col justify-between gap-3 rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "shadow-xs border-brand-indigo bg-brand-indigo/5 ring-2 ring-brand-indigo/20 dark:bg-brand-indigo/10"
          : "border-line bg-panel hover:border-line-2 hover:bg-panel-2"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-transform group-hover:scale-105 ${
            value === "CLIENT"
              ? "border border-[#F25C1F]/20 bg-[#FFEBE0] text-[#D94A12]"
              : "border border-[#4B3FD6]/20 bg-[#EEF0FD] text-[#4B3FD6]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Check Indicator */}
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full transition-all ${
            selected
              ? "scale-100 bg-brand-indigo text-white"
              : "scale-90 border border-line text-transparent opacity-40"
          }`}
        >
          <Check className="h-3 w-3 stroke-[3]" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold tracking-tight text-ink transition-colors group-hover:text-brand-indigo">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-ink-3">{description}</p>
      </div>
    </button>
  );
}

export function RoleCardGroup({ value = "CLIENT", onChange, className = "" }) {
  const containerRef = useRef(null);

  const roles = [
    {
      value: "CLIENT",
      title: "I want to hire",
      description:
        "Map internal workflows and hire vetted fractional Heads of AI.",
      icon: Briefcase,
    },
    {
      value: "STRATEGIST",
      title: "I'm a strategist",
      description:
        "Deploy autonomous systems and join high-value fractional roles.",
      icon: Sparkles,
    },
  ];

  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % roles.length;
      onChange(roles[nextIdx].value);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (index - 1 + roles.length) % roles.length;
      onChange(roles[prevIdx].value);
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="How will you use Loopwise?"
      className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 ${className}`}
    >
      {roles.map((role, idx) => (
        <RoleCard
          key={role.value}
          value={role.value}
          title={role.title}
          description={role.description}
          icon={role.icon}
          selected={value === role.value}
          onClick={() => onChange(role.value)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
        />
      ))}
    </div>
  );
}
