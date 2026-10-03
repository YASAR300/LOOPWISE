"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export function StrategistCarousel({ strategists = [] }) {
  const scrollRef = useRef(null);

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") scrollBy(-360);
    else if (e.key === "ArrowRight") scrollBy(360);
  };

  return (
    <section id="strategists" className="relative bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header with Navigation Controls */}
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                PRE-SCREENED TALENT
              </span>
            </div>
            <h2 className="font-display text-h2 font-bold tracking-tight text-ink">
              Featured Heads of AI & Automation
            </h2>
            <p className="mt-2 max-w-xl text-base text-ink-2">
              Real senior leaders with verified enterprise deployments in
              banking, healthcare, and software operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-360)}
              className="shadow-2xs rounded-full border border-line bg-panel p-2.5 text-ink-2 transition-colors hover:bg-canvas-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
              aria-label="Scroll left in strategists carousel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(360)}
              className="shadow-2xs rounded-full border border-line bg-panel p-2.5 text-ink-2 transition-colors hover:bg-canvas-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
              aria-label="Scroll right in strategists carousel"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scroll-Snap Container */}
        <div
          ref={scrollRef}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Approved AI Strategists Showcase"
          className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 focus:outline-none"
        >
          {strategists.map((st) => (
            <div
              key={st.id}
              className="warm-card flex w-[300px] shrink-0 snap-start flex-col justify-between p-6 sm:w-[340px]"
            >
              <div>
                {/* Header: Avatar, Name, Verified Badge, Rating */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-accent/20 bg-brand-accent-soft font-display text-sm font-bold text-brand-accent">
                      {st.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-ink">
                          {st.name}
                        </h3>
                        <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                      </div>
                      <p className="text-2xs text-ink-3">{st.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-status-warning-border bg-status-warning-bg px-2 py-0.5 text-2xs font-semibold text-status-warning-text">
                    <Star className="h-3 w-3 fill-status-warning-text" />
                    <span>{st.ratingAvg}</span>
                  </div>
                </div>

                <p className="mb-2 line-clamp-2 text-xs font-semibold leading-relaxed text-ink">
                  {st.headline}
                </p>

                <p className="mb-4 line-clamp-3 text-2xs leading-relaxed text-ink-2">
                  {st.bio}
                </p>

                {/* 3 Skill Chips */}
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {st.skills?.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-line bg-canvas-2 px-2 py-0.5 text-[11px] font-medium text-ink-2"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer: Rate Range & Profile Link */}
              <div className="flex items-center justify-between border-t border-line pt-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-ink-3">
                    Typical Rate
                  </p>
                  <p className="font-mono text-xs font-bold text-ink">
                    ${st.hourlyRateMin}–${st.hourlyRateMax}/hr
                  </p>
                </div>

                <Link
                  href={`/strategists/${st.slug}`}
                  className="btn-secondary-outline inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
                >
                  <span>Profile</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/strategists"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:underline"
          >
            <span>Browse all approved strategists in the directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
