"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function AnnouncementBar({ announcement }) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    // Save dismissal in a cookie valid for 30 days
    document.cookie =
      "lw_announcement_dismissed=true; path=/; max-age=2592000; SameSite=Lax";
    try {
      localStorage.setItem("lw_announcement_dismissed", "true");
    } catch {
      // Ignore
    }
  };

  if (dismissed || !announcement) return null;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 w-full border-b border-[#2C5241] bg-[#1E3B2E] px-4 py-2.5 text-xs font-medium text-[#F3F7F4]"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center justify-center gap-2 text-center">
          <span>{announcement.emoji || "⚡"}</span>
          <span>{announcement.text}</span>
          {announcement.linkUrl && (
            <Link
              href={announcement.linkUrl}
              className="inline-flex items-center gap-1 font-semibold text-[#F3F7F4] underline underline-offset-4 transition-colors hover:text-white"
            >
              <span>{announcement.linkText || "Learn more"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
