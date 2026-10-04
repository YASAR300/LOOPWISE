"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  ArrowRight,
  Clock,
  Building,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ToolChipRow } from "@/components/ui/tool-chip";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("ALL");

  useEffect(() => {
    fetchJobs();
  }, [search, modelFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (modelFilter !== "ALL") params.set("model", modelFilter);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <span className="border-brand-indigo/30 bg-brand-indigo/10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-brand-indigo">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Active Enterprise Demand</span>
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Open Fractional AI & Automation Roles
        </h1>
        <p className="text-sm text-ink-2">
          Discover high-intent enterprise workflow briefs, scoped with target
          deliverables and clear budget bands.
        </p>
      </div>

      {/* Filter Row */}
      <div className="shadow-xs flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, tools, or industries..."
            className="w-full rounded-xl border border-line bg-canvas py-2 pl-9 pr-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
          />
        </div>

        <select
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
        >
          <option value="ALL">All Engagement Models</option>
          <option value="RETAINER">Retainer (Fractional)</option>
          <option value="HOURLY">Hourly</option>
          <option value="FIXED">Fixed Scope</option>
        </select>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-ink-3">
          Loading open opportunities...
        </div>
      ) : jobs.length === 0 ? (
        <div className="shadow-xs rounded-2xl border border-line bg-panel p-12 text-center">
          <Briefcase className="mx-auto mb-2 h-8 w-8 text-ink-3" />
          <h3 className="text-sm font-semibold text-ink">
            No open roles match your query
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
            Check back soon as new client briefs are published daily.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-6 transition-all hover:border-line-2"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                      {job.organization.name}
                    </span>
                    <span className="rounded-full border border-line bg-panel-2 px-2 py-0.5 text-2xs text-ink-3">
                      {job.organization.industry || "Enterprise"}
                    </span>
                    <span className="font-mono text-xs font-bold text-ink">
                      $
                      {job.budget ? job.budget.toLocaleString() : "Market Rate"}{" "}
                      ({job.model.toLowerCase()})
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-ink transition-colors hover:text-brand-indigo">
                    <Link href={`/strategist/jobs/${job.id}/apply`}>
                      {job.title}
                    </Link>
                  </h3>

                  <p className="line-clamp-2 text-xs leading-relaxed text-ink-2">
                    {job.description}
                  </p>

                  <div className="pt-1">
                    <ToolChipRow tools={job.skills} limit={4} size="sm" />
                  </div>
                </div>

                <Link
                  href={`/strategist/jobs/${job.id}/apply`}
                  className="btn-primary-orange shadow-xs flex shrink-0 items-center gap-1.5 self-end px-4 py-2 text-xs font-semibold sm:self-auto"
                >
                  <span>Apply with Proposal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex items-center justify-between border-t border-line pt-3 text-2xs text-ink-3">
                <div className="flex items-center gap-3">
                  <span>{job.proposalsCount} proposals received</span>
                  <span>·</span>
                  <span>{job.hoursPerWeek || 20} hrs/week expected</span>
                </div>
                <span>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
