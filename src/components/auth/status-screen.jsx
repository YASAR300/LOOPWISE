import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export function StatusScreen({
  type = "success", // "success" | "warning" | "error"
  title,
  description,
  meta = null,
  actions = null,
  backLink = null,
}) {
  const configs =
    {
      success: {
        bg: "bg-[#EAF7EE] dark:bg-[#14291B]",
        text: "text-[#1E7A3C] dark:text-[#4ADE80]",
        border: "border-[#A9DDB8] dark:border-[#22502E]",
        icon: CheckCircle2,
      },
      warning: {
        bg: "bg-[#FFF6D6] dark:bg-[#2B2510]",
        text: "text-[#8A6A00] dark:text-[#FBBF24]",
        border: "border-[#EBD27A] dark:border-[#54481C]",
        icon: AlertTriangle,
      },
      error: {
        bg: "bg-[#FFECEC] dark:bg-[#331515]",
        text: "text-[#B42318] dark:text-[#F87171]",
        border: "border-[#F2B8B8] dark:border-[#5C2020]",
        icon: AlertCircle,
      },
    }[type] || configs.success;

  const Icon = configs.icon;

  return (
    <div className="space-y-5 text-center">
      {/* Branded Icon Tile */}
      <div
        className={`shadow-xs mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${configs.bg} ${configs.text} ${configs.border}`}
      >
        <Icon className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-ink-2 sm:text-sm">
          {description}
        </p>
      </div>

      {meta && <div className="py-1">{meta}</div>}

      {actions && <div className="space-y-2.5 pt-2">{actions}</div>}

      {backLink && (
        <div className="pt-2">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-indigo hover:underline"
          >
            <span>{backLink.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
