"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  MapPin,
  X,
} from "lucide-react";

export function StrategistDirectoryView({
  strategists = [],
  specializations = [],
  skillsList = [],
  initialFilters = {},
  totalCount = 0,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialFilters.q || "");
  const [selectedSpec, setSelectedSpec] = useState(initialFilters.spec || "");
  const [selectedSkill, setSelectedSkill] = useState(
    initialFilters.skill || ""
  );
  const [maxRate, setMaxRate] = useState(Number(initialFilters.maxRate) || 350);
  const [minRating, setMinRating] = useState(
    Number(initialFilters.minRating) || 0
  );
  const [sortBy, setSortBy] = useState(initialFilters.sort || "rating");
  const [savedMap, setSavedMap] = useState({});
  const [saveLoading, setSaveLoading] = useState({});
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [saveSearchSuccess, setSaveSearchSuccess] = useState(false);

  // Sync state to URL
  const applyFilters = (overrides = {}) => {
    const params = new URLSearchParams();
    const q = overrides.q !== undefined ? overrides.q : searchQuery;
    const spec = overrides.spec !== undefined ? overrides.spec : selectedSpec;
    const skill =
      overrides.skill !== undefined ? overrides.skill : selectedSkill;
    const rate = overrides.maxRate !== undefined ? overrides.maxRate : maxRate;
    const rating =
      overrides.minRating !== undefined ? overrides.minRating : minRating;
    const sort = overrides.sort !== undefined ? overrides.sort : sortBy;

    if (q) params.set("q", q);
    if (spec) params.set("spec", spec);
    if (skill) params.set("skill", skill);
    if (rate && rate < 350) params.set("maxRate", String(rate));
    if (rating && rating > 0) params.set("minRating", String(rating));
    if (sort && sort !== "rating") params.set("sort", sort);

    router.push(`/strategists?${params.toString()}`);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedSpec("");
    setSelectedSkill("");
    setMaxRate(350);
    setMinRating(0);
    setSortBy("rating");
    router.push("/strategists");
  };

  const handleToggleSave = async (profileId) => {
    setSaveLoading((prev) => ({ ...prev, [profileId]: true }));
    try {
      const res = await fetch("/api/strategists/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedMap((prev) => ({ ...prev, [profileId]: data.saved }));
      } else if (res.status === 401) {
        router.push(`/login?redirect=/strategists`);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaveLoading((prev) => ({ ...prev, [profileId]: false }));
    }
  };

  const handleSaveSearch = async () => {
    try {
      const res = await fetch("/api/searches/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${selectedSpec || "All Domains"} • Max $${maxRate}/hr`,
          filters: {
            q: searchQuery,
            spec: selectedSpec,
            skill: selectedSkill,
            maxRate,
            minRating,
          },
        }),
      });
      if (res.ok) {
        setSaveSearchSuccess(true);
        setTimeout(() => setSaveSearchSuccess(false), 3000);
      } else if (res.status === 401) {
        router.push("/login?redirect=/strategists");
      }
    } catch {
      // Ignore
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedSpec ||
    selectedSkill ||
    maxRate < 350 ||
    minRating > 0
  );

  return (
    <div className="space-y-8">
      {/* Top Search & Filter Bar */}
      <div className="warm-card shadow-2xs flex flex-col items-center justify-between gap-4 p-4 sm:p-5 md:flex-row">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && applyFilters({ q: searchQuery })
            }
            placeholder="Search by expertise, tool (e.g. LangGraph), or name..."
            className="w-full rounded-lg border border-line bg-canvas py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo sm:text-sm"
          />
        </div>

        {/* Sort & Quick Filter Action */}
        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink md:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold uppercase text-ink-3">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                applyFilters({ sort: e.target.value });
              }}
              className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            >
              <option value="rating">Top Rated</option>
              <option value="rate_asc">Rate: Low to High</option>
              <option value="rate_desc">Rate: High to Low</option>
              <option value="experience">Years Experience</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Left Filter Sidebar */}
        <div
          className={`${
            showFiltersMobile ? "block" : "hidden"
          } warm-card shadow-2xs h-fit space-y-6 p-5 md:col-span-1 md:block`}
        >
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Filter Talent
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-2xs font-semibold text-brand-accent hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Specialization Filter */}
          <div className="space-y-2">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Specialization
            </label>
            <select
              value={selectedSpec}
              onChange={(e) => {
                setSelectedSpec(e.target.value);
                applyFilters({ spec: e.target.value });
              }}
              className="w-full rounded-lg border border-line bg-canvas p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec.slug} value={spec.slug}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Key Skill Filter */}
          <div className="space-y-2">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Core Technical Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                applyFilters({ skill: e.target.value });
              }}
              className="w-full rounded-lg border border-line bg-canvas p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            >
              <option value="">All Frameworks & Tools</option>
              {skillsList.map((sk) => (
                <option key={sk.slug} value={sk.slug}>
                  {sk.name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Hourly Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-2xs">
              <span className="font-semibold uppercase text-ink-3">
                Max Hourly Rate
              </span>
              <span className="font-mono font-bold text-ink">
                ${maxRate}/hr
              </span>
            </div>
            <input
              type="range"
              min={180}
              max={350}
              step={10}
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              onMouseUp={() => applyFilters({ maxRate })}
              className="w-full cursor-pointer accent-brand-accent"
            />
          </div>

          {/* Save Search Button */}
          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={handleSaveSearch}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas-2 px-3 py-2 text-xs font-semibold text-ink transition-all hover:bg-canvas"
            >
              <Bookmark className="h-3.5 w-3.5 text-brand-accent" />
              <span>
                {saveSearchSuccess ? "Search Saved!" : "Save this search"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Strategist Cards Grid */}
        <div className="space-y-6 md:col-span-3">
          {/* Active Chips & Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-2">
            <p>
              Showing <strong className="text-ink">{strategists.length}</strong>{" "}
              vetted AI leaders
              {totalCount > strategists.length && ` of ${totalCount}`}
            </p>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedSpec && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/20 bg-brand-accent-soft px-2.5 py-0.5 text-2xs font-medium text-brand-accent">
                    {selectedSpec}
                    <button onClick={() => applyFilters({ spec: "" })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSkill && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas-2 px-2.5 py-0.5 text-2xs font-medium text-ink">
                    {selectedSkill}
                    <button onClick={() => applyFilters({ skill: "" })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Cards List */}
          {strategists.length === 0 ? (
            <div className="warm-card shadow-2xs space-y-3 p-12 text-center">
              <p className="font-display text-lg font-bold text-ink">
                No strategists match this criteria
              </p>
              <p className="text-xs text-ink-2">
                Try widening your rate filter, clearing specific skills, or
                searching for broader terms.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="btn-primary-orange mt-2 px-5 py-2 text-xs font-semibold"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {strategists.map((st) => (
                <div
                  key={st.id}
                  className="warm-card shadow-2xs hover:shadow-soft flex flex-col justify-between p-6 transition-all duration-200"
                >
                  <div>
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="shadow-2xs flex h-12 w-12 items-center justify-center rounded-full bg-tile-violet font-display text-sm font-bold text-white">
                          {st.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display text-sm font-bold tracking-tight text-ink">
                              {st.name}
                            </h3>
                            <ShieldCheck className="h-4 w-4 text-forest" />
                          </div>
                          <div className="flex items-center gap-1 text-2xs text-ink-3">
                            <MapPin className="h-3 w-3" />
                            <span>{st.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(st.id)}
                        disabled={saveLoading[st.id]}
                        className="rounded-lg border border-line p-2 text-ink-3 transition-colors hover:bg-canvas-2 hover:text-brand-accent"
                        aria-label="Save strategist"
                      >
                        {savedMap[st.id] ? (
                          <BookmarkCheck className="h-4 w-4 text-brand-accent" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Rating & Availability */}
                    <div className="mb-3 flex items-center justify-between gap-2 text-2xs">
                      <div className="flex items-center gap-1 rounded-full border border-line bg-canvas-2 px-2 py-0.5 text-ink">
                        <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
                        <span className="font-semibold">{st.ratingAvg}</span>
                        <span className="text-ink-3">({st.ratingCount})</span>
                      </div>
                      <span className="flex items-center gap-1 font-semibold text-forest">
                        <Clock className="h-3 w-3" />
                        <span>
                          {st.availabilityHoursPerWeek || 20}h/wk open
                        </span>
                      </span>
                    </div>

                    {/* Headline */}
                    <p className="mb-2 line-clamp-2 text-xs font-semibold leading-relaxed text-ink">
                      {st.headline}
                    </p>

                    {/* Bio */}
                    <p className="mb-4 line-clamp-3 text-2xs leading-relaxed text-ink-2">
                      {st.bio}
                    </p>

                    {/* Skills Chips */}
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

                  {/* Card Footer: Rates & Profile Link */}
                  <div className="flex items-center justify-between border-t border-line pt-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase text-ink-3">
                        Hourly Rate
                      </p>
                      <p className="text-xs font-bold text-ink">
                        ${st.hourlyRateMin}–${st.hourlyRateMax}/hr
                      </p>
                    </div>

                    <Link
                      href={`/strategists/${st.slug}`}
                      className="btn-secondary-outline inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="h-3 w-3 text-brand-accent" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
