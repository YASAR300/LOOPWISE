"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past hero (e.g. 500px)
      if (window.scrollY > 480) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-panel/95 shadow-warm fixed bottom-0 left-0 right-0 z-40 border-t border-line px-4 py-3 backdrop-blur-md transition-transform duration-200 sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-display text-xs font-bold text-ink">
            Fractional Heads of AI
          </span>
          <span className="text-[11px] text-ink-3">Top 3% vetted leaders</span>
        </div>

        <Link
          href="/signup?role=client"
          className="btn-primary-orange flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-sm"
        >
          <span>Hire an AI leader</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
