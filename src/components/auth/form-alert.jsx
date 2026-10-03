"use client";

import React, { useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export function FormAlert({
  type = "error", // "error" | "warning" | "success" | "info"
  message = "",
  description = null,
  action = null,
  onDismiss = null,
  className = "",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onDismiss) {
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  if (!message) return null;

  const styles =
    {
      error: {
        bg: "bg-[#FFECEC] dark:bg-[#331515]",
        border: "border-[#F2B8B8] dark:border-[#5C2020]",
        text: "text-[#B42318] dark:text-[#F87171]",
        icon: AlertCircle,
      },
      warning: {
        bg: "bg-[#FFF6D6] dark:bg-[#2B2510]",
        border: "border-[#EBD27A] dark:border-[#54481C]",
        text: "text-[#8A6A00] dark:text-[#FBBF24]",
        icon: AlertTriangle,
      },
      success: {
        bg: "bg-[#EAF7EE] dark:bg-[#14291B]",
        border: "border-[#A9DDB8] dark:border-[#22502E]",
        text: "text-[#1E7A3C] dark:text-[#4ADE80]",
        icon: CheckCircle2,
      },
      info: {
        bg: "bg-[#EEF0FD] dark:bg-[#1D1C38]",
        border: "border-[#C6CBF7] dark:border-[#323068]",
        text: "text-[#4B3FD6] dark:text-[#A5B4FC]",
        icon: Info,
      },
    }[type] || styles.error;

  const Icon = styles.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-xl border p-3 ${styles.bg} ${styles.border} ${styles.text} animate-in fade-in duration-160 flex items-start gap-2.5 text-xs transition-all ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{message}</p>
        {description && (
          <p className="mt-1 text-[11px] leading-relaxed opacity-90">
            {description}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Dismiss alert (Press Escape)"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
