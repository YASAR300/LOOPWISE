"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  Search,
  Bookmark,
  Clock,
  DollarSign,
  ArrowRight,
  Filter,
  CheckCircle2,
  Send,
  Building,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ToolChipRow } from "@/components/ui/tool-chip";

export default function StrategistJobsPage() {
  const searchParams = useSearchParams();
  const initialInvite = searchParams.get("invite");
  const initialBrief = searchParams.get("briefId");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [skillFilter, setSkillFilter] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [search, modelFilter, skillFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (modelFilter !== "ALL") params.set("model", modelFilter);
      if (skillFilter.trim()) params.set("skill", skillFilter.trim());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to load opportunities");
      setJobs(data.jobs || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      const res = await fetch(`/api/strategist/jobs/${jobId}/save`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save job");

      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: data.saved } : j))
      );
      toast.success(
        data.saved ? "Saved to bookmarks" : "Removed from bookmarks"
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Client Brief Opportunities
          </h1>
          <p className="text-xs text-ink-3">
            Vetted enterprises looking for Fractional Heads of AI & Automation
          </p>
        </div>

        <Link
          href="/strategist/proposals"
          className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <span>My Submitted Proposals</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {initialInvite && (
        <div className="border-brand-indigo/30 bg-brand-indigo/10 flex items-center justify-between gap-3 rounded-xl border p-4 text-xs">
          <div className="flex items-center gap-2 text-ink">
            <Sparkles className="h-4 w-4 text-brand-indigo" />
            <span>
              You have an active invitation to submit a proposal! Review the job
              below to apply.
            </span>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, companies, or tools..."
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

        <input
          type="text"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          placeholder="Filter by skill (e.g. LangGraph)"
          className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
        />
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-ink-3">
          Loading available opportunities...
        </div>
      ) : jobs.length === 0 ? (
        <div className="shadow-xs rounded-2xl border border-line bg-panel p-12 text-center">
          <Briefcase className="mx-auto mb-2 h-8 w-8 text-ink-3" />
          <h3 className="text-sm font-semibold text-ink">
            No matching opportunities found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
            Try loosening your search terms or filters to explore all available
            client briefs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-5 transition-all hover:border-line-2"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                      {job.organization.name}
                    </span>
                    <span className="rounded-full border border-line bg-panel-2 px-2 py-0.5 text-2xs text-ink-3">
                      {job.organization.industry || "Enterprise"}
                    </span>
                    <span className="font-mono text-xs font-bold text-ink">
                      $
                      {job.budget
                        ? `${job.budget.toLocaleString()}`
                        : "Market Rate"}{" "}
                      ({job.model.toLowerCase()})
                    </span>
                  </div>

                  <h3 className="text-base font-bold leading-tight text-ink transition-colors hover:text-brand-indigo">
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

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(job.id)}
                    className={`rounded-lg border p-2 transition-colors ${
                      job.isSaved
                        ? "border-brand-accent bg-brand-accent-soft text-brand-accent"
                        : "border-line text-ink-3 hover:bg-panel-2 hover:text-ink"
                    }`}
                    title={job.isSaved ? "Saved to bookmarks" : "Save job"}
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>

                  {job.hasApplied ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <Link
                      href={`/strategist/jobs/${job.id}/apply`}
                      className="btn-primary-orange shadow-xs flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
                    >
                      <span>Submit Proposal</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-2xs text-ink-3">
                <div className="flex items-center gap-3">
                  <span>{job.proposalsCount} proposals received</span>
                  <span>·</span>
                  <span>{job.hoursPerWeek || 20} hrs/week expected</span>
                  {job.timeline && (
                    <>
                      <span>·</span>
                      <span>{job.timeline}</span>
                    </>
                  )}
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
