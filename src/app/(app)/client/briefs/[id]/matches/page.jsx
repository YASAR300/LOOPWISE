"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Users,
  ArrowLeft,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  DollarSign,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Bookmark,
  X,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ToolChipRow } from "@/components/ui/tool-chip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Circular score ring component
function ScoreRing({ score = 0, size = 64, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 85
      ? "text-emerald-500"
      : score >= 70
        ? "text-brand-indigo"
        : "text-amber-500";

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90 transform" width={size} height={size}>
        <circle
          className="text-line"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-base font-bold leading-none text-ink">
          {Math.round(score)}%
        </span>
        <span className="text-[9px] font-medium uppercase tracking-tighter text-ink-3">
          match
        </span>
      </div>
    </div>
  );
}

// Compact dimension breakdown bar
function BreakdownBar({ label, score, max }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-2xs">
        <span className="font-medium text-ink-2">{label}</span>
        <span className="font-mono font-bold text-ink">
          {score}/{max}
        </span>
      </div>
      <div className="border-line/60 h-1.5 w-full overflow-hidden rounded-full border bg-panel-2">
        <div
          className="h-full rounded-full bg-brand-indigo transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BriefMatchesPage({ params }) {
  const unwrappedParams = use(params);
  const briefId = unwrappedParams.id;
  const router = useRouter();

  const [brief, setBrief] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Modals state
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [dismissTarget, setDismissTarget] = useState(null);
  const [dismissReason, setDismissReason] = useState(
    "Out of preferred budget band"
  );
  const [dismissing, setDismissing] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [introTarget, setIntroTarget] = useState(null);
  const [introDate, setIntroDate] = useState("");
  const [introMessage, setIntroMessage] = useState("");
  const [bookingIntro, setBookingIntro] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [briefId]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/client/briefs/${briefId}/matches`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load matches");
      setBrief(data.brief);
      setMatches(data.matches || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/matches/recompute`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recompute failed");
      toast.success(`Refreshed ${data.matchCount} candidate matches`);
      await fetchMatches();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRecomputing(false);
    }
  };

  const handleShortlist = async (matchId, strategistId) => {
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/matches/${strategistId}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "shortlist" }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update shortlist");

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId ? { ...m, isShortlisted: data.isShortlisted } : m
        )
      );
      toast.success(
        data.isShortlisted ? "Added to shortlist" : "Removed from shortlist"
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDismissConfirm = async () => {
    if (!dismissTarget) return;
    setDismissing(true);
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/matches/${dismissTarget.strategist.id}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "dismiss", reason: dismissReason }),
        }
      );
      if (!res.ok) throw new Error("Dismissal failed");

      setMatches((prev) => prev.filter((m) => m.id !== dismissTarget.id));
      setSelectedForCompare((prev) =>
        prev.filter((id) => id !== dismissTarget.strategist.id)
      );
      toast.info("Candidate dismissed and weights training logged");
      setDismissTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDismissing(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (!inviteTarget) return;
    setInviting(true);
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/matches/${inviteTarget.strategist.id}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "invite", message: inviteMessage }),
        }
      );
      if (!res.ok) throw new Error("Invitation failed");

      setMatches((prev) =>
        prev.map((m) =>
          m.id === inviteTarget.id ? { ...m, invitationStatus: "PENDING" } : m
        )
      );
      toast.success(`Invitation sent to ${inviteTarget.strategist.name}`);
      setInviteTarget(null);
      setInviteMessage("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleIntroSubmit = async () => {
    if (!introTarget) return;
    setBookingIntro(true);
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/matches/${introTarget.strategist.id}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "intro",
            requestedDate: introDate,
            message: introMessage,
          }),
        }
      );
      if (!res.ok) throw new Error("Intro request failed");
      toast.success(`Intro call requested with ${introTarget.strategist.name}`);
      setIntroTarget(null);
      setIntroDate("");
      setIntroMessage("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBookingIntro(false);
    }
  };

  const toggleCompare = (strategistId) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(strategistId)) {
        return prev.filter((id) => id !== strategistId);
      }
      if (prev.length >= 4) {
        toast.warning("You can compare up to 4 strategists at once.");
        return prev;
      }
      return [...prev, strategistId];
    });
  };

  const displayedMatches = showAll ? matches : matches.slice(0, 5);
  const compareStrategists = matches
    .filter((m) => selectedForCompare.includes(m.strategist.id))
    .map((m) => ({ ...m.strategist, score: m.score, breakdown: m.breakdown }));

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/client/briefs`)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-panel text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-ink">
                AI Talent Matching: {brief?.title || "Brief"}
              </h1>
              <span className="border-brand-indigo/30 bg-brand-indigo/10 rounded-full border px-2 py-0.5 text-2xs font-semibold text-brand-indigo">
                {matches.length} Candidates Scored
              </span>
            </div>
            <p className="text-xs text-ink-3">
              Ranked with deterministic multi-factor fit + Anthropic Claude
              fact-grounded audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/client/briefs/${briefId}/workflows`}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
          >
            Workflow Map
          </Link>
          <Link
            href={`/client/shortlist`}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
          >
            <Bookmark className="h-3.5 w-3.5 text-brand-accent" />
            <span>Shortlist</span>
          </Link>
          <button
            type="button"
            onClick={handleRecompute}
            disabled={recomputing || loading}
            className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${recomputing ? "animate-spin" : ""}`}
            />
            <span>{recomputing ? "Re-scoring..." : "Recompute Matches"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="shadow-xs rounded-2xl border border-line bg-panel p-16 text-center">
          <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-brand-indigo" />
          <h3 className="text-sm font-semibold text-ink">
            Running Multi-Factor Matching Algorithm
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
            Evaluating skill depth, workflow domain category, budget alignment,
            and timezone overlap...
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="shadow-xs rounded-2xl border border-line bg-panel p-12 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-ink-3" />
          <h3 className="text-sm font-semibold text-ink">
            No candidate matches found
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-ink-3">
            Try adjusting your required skills or budget requirements on the
            brief.
          </p>
          <button
            type="button"
            onClick={handleRecompute}
            className="btn-primary-indigo mt-4 px-4 py-2 text-xs font-semibold"
          >
            Run Matching Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-3">
                {showAll
                  ? "All Scored Candidates"
                  : "Top 5 Recommended Matches"}
              </h2>
              <span className="rounded-full border border-line bg-panel-2 px-2 py-0.5 font-mono text-2xs font-bold text-ink">
                {displayedMatches.length} of {matches.length}
              </span>
            </div>
            {matches.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-indigo hover:underline"
              >
                <span>
                  {showAll
                    ? "Show Top 5 Only"
                    : `Show All ${matches.length} Matches`}
                </span>
                {showAll ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Matches List Cards */}
          <div className="space-y-4">
            {displayedMatches.map((m, index) => {
              const s = m.strategist;
              const isSelected = selectedForCompare.includes(s.id);

              return (
                <div
                  key={m.id}
                  className={`shadow-xs relative rounded-2xl border bg-panel p-5 transition-all hover:border-line-2 ${
                    m.isShortlisted
                      ? "bg-amber-500/2 border-brand-accent/40"
                      : "border-line"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left: Candidate Info & AI Explanation */}
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      {/* Checkbox for compare */}
                      <div className="pt-1.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(s.id)}
                          aria-label={`Select ${s.name} for comparison`}
                          className="h-4 w-4 cursor-pointer rounded border-line text-brand-indigo accent-[#4B3FD6]"
                        />
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {s.image ? (
                          <img
                            src={s.image}
                            alt={s.name}
                            className="h-14 w-14 rounded-2xl border border-line object-cover"
                          />
                        ) : (
                          <div className="bg-tile-indigo flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white">
                            {s.name.charAt(0)}
                          </div>
                        )}
                        <span className="shadow-xs absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Strategist Details */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/strategists/${s.slug || s.id}`}
                            className="flex items-center gap-1.5 text-base font-bold text-ink transition-colors hover:text-brand-indigo"
                          >
                            <span>{s.name}</span>
                            <ExternalLink className="h-3 w-3 text-ink-3" />
                          </Link>

                          {s.ratingAvg && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-2xs font-semibold text-amber-700 dark:text-amber-300">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span>{s.ratingAvg.toFixed(1)}</span>
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-panel-2 px-2 py-0.5 text-2xs text-ink-3">
                            <Clock className="h-3 w-3" />
                            <span>{s.weeklyAvailability || 20} hrs/wk</span>
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-panel-2 px-2 py-0.5 text-2xs text-ink-3">
                            <MapPin className="h-3 w-3" />
                            <span>{s.timezone || "UTC"}</span>
                          </span>

                          <span className="font-mono text-xs font-bold text-ink">
                            ${s.hourlyRate || 150}/hr
                          </span>
                        </div>

                        <p className="line-clamp-1 text-xs font-medium text-ink-2">
                          {s.headline}
                        </p>

                        {/* Skills */}
                        <div className="pt-1">
                          <ToolChipRow
                            tools={s.skills.map((sk) => sk.name)}
                            limit={4}
                            size="sm"
                          />
                        </div>

                        {/* AI Match Explanation Callout */}
                        <div className="border-brand-indigo/15 bg-brand-indigo/5 space-y-1.5 rounded-xl border p-3 text-xs">
                          <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-brand-indigo">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Why this match (AI verified)</span>
                          </div>
                          <p className="leading-relaxed text-ink">
                            {m.explanation}
                          </p>

                          {m.watchOuts &&
                            m.watchOuts !==
                              "No material blockers identified." && (
                              <div className="border-brand-indigo/10 flex items-start gap-1.5 border-t pt-1 text-2xs text-amber-800 dark:text-amber-300">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                                <span>
                                  <strong>Watch-out:</strong> {m.watchOuts}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Ring & Multi-Factor Breakdown */}
                    <div className="bg-panel-2/60 flex shrink-0 items-center gap-6 rounded-xl border border-line p-4 lg:w-72">
                      <ScoreRing score={m.score} />

                      <div className="flex-1 space-y-2">
                        <BreakdownBar
                          label="Skills Match"
                          score={m.breakdown?.skillCoverage?.score || 0}
                          max={m.breakdown?.skillCoverage?.max || 30}
                        />
                        <BreakdownBar
                          label="Budget Fit"
                          score={m.breakdown?.budgetFit?.score || 0}
                          max={m.breakdown?.budgetFit?.max || 15}
                        />
                        <BreakdownBar
                          label="Timezone Overlap"
                          score={m.breakdown?.timezoneOverlap?.score || 0}
                          max={m.breakdown?.timezoneOverlap?.max || 10}
                        />
                        <BreakdownBar
                          label="Domain & Industry"
                          score={m.breakdown?.industryRelevance?.score || 0}
                          max={m.breakdown?.industryRelevance?.max || 10}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                    <div className="flex items-center gap-2 text-2xs text-ink-3">
                      {m.invitationStatus ? (
                        <span className="border-brand-indigo/30 bg-brand-indigo/10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold text-brand-indigo">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Invitation Sent ({m.invitationStatus})</span>
                        </span>
                      ) : (
                        <span>Ready for client outreach</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleShortlist(m.id, s.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          m.isShortlisted
                            ? "border-brand-accent bg-brand-accent-soft text-brand-accent"
                            : "border-line bg-panel text-ink hover:bg-panel-2"
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>
                          {m.isShortlisted ? "Shortlisted" : "Shortlist"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDismissTarget(m)}
                        className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                      >
                        Dismiss
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIntroTarget(m);
                          setIntroDate(
                            new Date(Date.now() + 86400000 * 2)
                              .toISOString()
                              .slice(0, 16)
                          );
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-panel-2"
                      >
                        <Calendar className="h-3.5 w-3.5 text-ink-3" />
                        <span>Request Intro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInviteTarget(m);
                          setInviteMessage(
                            `Hi ${s.name}, we loved your profile and would like to invite you to submit a proposal for our brief "${brief?.title}".`
                          );
                        }}
                        className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Invite to Brief</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Compare Action Bar */}
      {selectedForCompare.length > 0 && (
        <div className="shadow-warm animate-in fade-in slide-in-from-bottom-3 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-line-2 bg-[#1B1A17] px-5 py-3 text-white">
          <span className="text-xs font-semibold">
            {selectedForCompare.length} of 4 strategists selected
          </span>
          <div className="h-4 w-px bg-white/20" />
          <button
            type="button"
            onClick={() => setCompareModalOpen(true)}
            className="btn-primary-orange flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Compare Side-by-Side</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedForCompare([])}
            className="text-xs text-white/60 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Dismiss Confirmation Dialog */}
      <Dialog
        open={!!dismissTarget}
        onOpenChange={(open) => !open && setDismissTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dismiss Candidate</DialogTitle>
            <DialogDescription>
              Dismissing {dismissTarget?.strategist.name} removes them from this
              brief's recommendations and helps train your match weighting
              preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-ink">
              Reason for dismissal:
            </label>
            <select
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            >
              <option value="Out of preferred budget band">
                Out of preferred budget band
              </option>
              <option value="Missing key required tool/skill">
                Missing key required tool/skill
              </option>
              <option value="Timezone overlap too narrow">
                Timezone overlap too narrow
              </option>
              <option value="Not enough industry/case-study proof">
                Not enough industry/case-study proof
              </option>
              <option value="Looking for a different seniority level">
                Looking for a different seniority level
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDismissTarget(null)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-3 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={dismissing}
              onClick={handleDismissConfirm}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {dismissing ? "Dismissing..." : "Confirm Dismiss"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite to Brief Dialog */}
      <Dialog
        open={!!inviteTarget}
        onOpenChange={(open) => !open && setInviteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Submit Proposal</DialogTitle>
            <DialogDescription>
              Send an official invitation to {inviteTarget?.strategist.name} for
              "{brief?.title}".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-ink">
              Personal Note to Strategist:
            </label>
            <textarea
              rows={4}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              placeholder="Explain why you think they are a great fit..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setInviteTarget(null)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-3 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={inviting}
              onClick={handleInviteSubmit}
              className="btn-primary-indigo px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {inviting ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Intro Scoping Call Request Dialog */}
      <Dialog
        open={!!introTarget}
        onOpenChange={(open) => !open && setIntroTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Intro Scoping Call</DialogTitle>
            <DialogDescription>
              Schedule an introductory 30-minute discovery session with{" "}
              {introTarget?.strategist.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">
                Proposed Date & Time:
              </label>
              <input
                type="datetime-local"
                value={introDate}
                onChange={(e) => setIntroDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">
                Topics / Scoping Agenda:
              </label>
              <textarea
                rows={3}
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                placeholder="Let's discuss the workflow bottlenecks and agent architecture..."
                className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIntroTarget(null)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-3 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={bookingIntro}
              onClick={handleIntroSubmit}
              className="btn-primary-indigo px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {bookingIntro ? "Scheduling..." : "Request Call"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Side-by-Side Candidate Comparison Modal */}
      <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Side-by-Side Comparison</DialogTitle>
            <DialogDescription>
              Comparing {compareStrategists.length} shortlisted strategists on
              rates, skills overlap, availability, and case studies.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto pt-3">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-panel-2">
                  <th className="w-40 p-3 font-semibold text-ink-3">
                    Criteria
                  </th>
                  {compareStrategists.map((cs) => (
                    <th
                      key={cs.id}
                      className="min-w-[200px] p-3 font-bold text-ink"
                    >
                      <div className="flex items-center gap-2">
                        <span>{cs.name}</span>
                        <span className="font-mono text-xs font-bold text-brand-indigo">
                          ({Math.round(cs.score)}%)
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                <tr>
                  <td className="p-3 font-semibold text-ink-3">Hourly Rate</td>
                  {compareStrategists.map((cs) => (
                    <td key={cs.id} className="p-3 font-mono font-bold">
                      ${cs.hourlyRate || 150}/hr
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink-3">
                    Weekly Availability
                  </td>
                  {compareStrategists.map((cs) => (
                    <td key={cs.id} className="p-3">
                      {cs.weeklyAvailability || 20} hrs/week
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink-3">Timezone</td>
                  {compareStrategists.map((cs) => (
                    <td key={cs.id} className="p-3">
                      {cs.timezone || "UTC"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink-3">
                    Years Experience
                  </td>
                  {compareStrategists.map((cs) => (
                    <td key={cs.id} className="p-3">
                      {cs.yearsOfExperience || 5}+ years
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink-3">Top Skills</td>
                  {compareStrategists.map((cs) => (
                    <td key={cs.id} className="p-3">
                      <ToolChipRow
                        tools={cs.skills.map((sk) => sk.name)}
                        limit={3}
                        size="sm"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink-3">Case Studies</td>
                  {compareStrategists.map((cs) => (
                    <td key={cs.id} className="space-y-1 p-3">
                      {cs.caseStudies?.slice(0, 2).map((c, i) => (
                        <div
                          key={i}
                          className="rounded border border-line bg-panel-2 p-1.5 text-2xs"
                        >
                          <p className="font-semibold text-ink">{c.title}</p>
                          <p className="text-ink-3">
                            {c.outcome || c.clientIndustry}
                          </p>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
