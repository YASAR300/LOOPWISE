import React from "react";
import { Mail, Edit2 } from "lucide-react";

export function EmailPill({ email = "", onEdit = null, className = "" }) {
  if (!email) return null;

  return (
    <div
      className={`shadow-2xs inline-flex select-none items-center gap-2 rounded-full border border-line bg-panel-2 px-3 py-1.5 font-mono text-xs text-ink ${className}`}
    >
      <Mail className="h-3.5 w-3.5 shrink-0 text-brand-indigo" />
      <span className="max-w-[240px] truncate font-semibold">{email}</span>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="ml-1 cursor-pointer rounded p-0.5 text-ink-3 transition-colors hover:bg-canvas hover:text-brand-indigo"
          title="Edit email address"
          aria-label="Edit email address"
        >
          <Edit2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
