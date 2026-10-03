"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Search,
  Filter,
  Sparkles,
  ArrowLeft,
  Lock,
  Mail,
  Edit2,
  Calendar,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function AdminVettingPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null); // 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT'
  const [actionReason, setActionReason] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [manualScores, setManualScores] = useState({});

  // Fetch queue
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/vetting?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch vetting queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  // Fetch applicant dossier when selected
  useEffect(() => {
    if (!selectedApplicantId) {
      setDossier(null);
      return;
    }

    async function loadDossier() {
      try {
        setDossierLoading(true);
        const res = await fetch(`/api/admin/vetting?id=${selectedApplicantId}`);
        if (res.ok) {
          const data = await res.json();
          setDossier(data.applicant);
        }
      } catch (err) {
        console.error("Failed to load applicant dossier", err);
      } finally {
        setDossierLoading(false);
      }
    }

    loadDossier();
  }, [selectedApplicantId]);

  const handleAction = async (actionType) => {
    if (!selectedApplicantId) return;
    try {
      setActionLoading(true);
      let toStatus = "IN_REVIEW";
      if (actionType === "APPROVE") toStatus = "APPROVED";
      if (actionType === "REQUEST_CHANGES") toStatus = "DRAFT";
      if (actionType === "REJECT") toStatus = "REJECTED";

      const res = await fetch("/api/admin/vetting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transition",
          strategistProfileId: selectedApplicantId,
          toStatus,
          reason: actionReason,
          reviewerNotes,
        }),
      });

      if (res.ok) {
        setActionModal(null);
        setActionReason("");
        setReviewerNotes("");
        // Refresh dossier and queue
        const refreshedDossier = await fetch(
          `/api/admin/vetting?id=${selectedApplicantId}`
        );
        if (refreshedDossier.ok) {
          const data = await refreshedDossier.json();
          setDossier(data.applicant);
        }
        fetchQueue();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update vetting status");
      }
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleScoreOverride = async (attemptId, newScore) => {
    try {
      const res = await fetch("/api/admin/vetting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "override_score",
          attemptId,
          manualScore: newScore,
          overrideNotes: "Admin score calibrated during manual review",
        }),
      });
      if (res.ok) {
        alert("Score override saved");
        const refreshedDossier = await fetch(
          `/api/admin/vetting?id=${selectedApplicantId}`
        );
        if (refreshedDossier.ok) {
          const data = await refreshedDossier.json();
          setDossier(data.applicant);
        }
      }
    } catch (err) {
      console.error("Override failed", err);
    }
  };

  // SLA calculation helper
  const getSlaBadge = (slaDeadline, status) => {
    if (status === "APPROVED" || status === "REJECTED") {
      return (
        <Badge variant="outline" className="border-line text-ink-3">
          Resolved
        </Badge>
      );
    }
    if (!slaDeadline) {
      return (
        <Badge variant="outline" className="text-ink-4 border-line">
          No SLA Set
        </Badge>
      );
    }

    const now = new Date();
    const deadline = new Date(slaDeadline);
    const diffHours = Math.round((deadline - now) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return (
        <Badge
          variant="outline"
          className="border-red-300 bg-red-50 text-red-700"
        >
          SLA Breached ({Math.abs(diffHours)}h ago)
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-amber-800"
      >
        <Clock className="mr-1 h-3 w-3" /> {diffHours}h SLA Remaining
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="border border-emerald-300 bg-emerald-50 text-emerald-700">
            Approved
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge className="bg-brand-indigo/10 border-brand-indigo/30 border text-brand-indigo">
            In Review
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge className="border border-amber-300 bg-amber-50 text-amber-800">
            Submitted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="border border-red-300 bg-red-50 text-red-700">
            Rejected
          </Badge>
        );
      case "DRAFT":
      default:
        return (
          <Badge variant="outline" className="border-line text-ink-3">
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="border-brand-indigo/20 bg-brand-indigo/10 flex h-10 w-10 items-center justify-center rounded-xl border text-brand-indigo">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Strategist Vetting Pipeline
            </h1>
            <p className="text-xs text-ink-3">
              Admissions queue, scenario assessment scoring & technical
              validation
            </p>
          </div>
        </div>

        {selectedApplicantId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedApplicantId(null)}
            className="bg-surface gap-2 border-line"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Queue Table
          </Button>
        )}
      </div>

      {/* ================= QUEUE TABLE VIEW ================= */}
      {!selectedApplicantId && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-surface shadow-xs flex flex-col gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 sm:max-w-md">
              <Search className="h-4 w-4 text-ink-3" />
              <input
                type="text"
                placeholder="Search candidates by name, email or headline..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchQueue()}
                className="placeholder:text-ink-4 w-full bg-transparent text-xs text-ink outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-ink-3" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-ink outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted (Needs Action)</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
              </select>
              <Button size="sm" variant="secondary" onClick={fetchQueue}>
                Refresh
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3">
              <LogoLoader />
              <p className="text-xs text-ink-3">
                Loading vetting applicants...
              </p>
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-surface rounded-xl border border-line p-12 text-center">
              <ShieldCheck className="text-ink-4 mx-auto h-8 w-8" />
              <h3 className="mt-2 text-sm font-semibold text-ink">
                No applicants found
              </h3>
              <p className="text-xs text-ink-3">
                No strategists match the current status filter or search query.
              </p>
            </div>
          ) : (
            <div className="bg-surface shadow-xs overflow-hidden rounded-xl border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-canvas font-semibold uppercase tracking-wider text-ink-3">
                  <tr>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">SLA Target</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Case Studies</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {queue.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedApplicantId(app.id)}
                      className="hover:bg-canvas/60 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-brand-indigo/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-brand-indigo">
                            {app.user?.name?.[0] || "S"}
                          </div>
                          <div>
                            <div className="font-semibold text-ink">
                              {app.user?.name || "Unnamed"}
                            </div>
                            <div className="text-2xs text-ink-3">
                              {app.headline || app.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getSlaBadge(app.slaDeadline, app.status)}
                      </td>
                      <td className="px-4 py-3 text-ink-2">
                        {app.yearsExperience
                          ? `${app.yearsExperience} yrs`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-2">
                        {app.caseStudies?.length || 0} studies
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-brand-indigo/80 text-brand-indigo"
                        >
                          Review Dossier{" "}
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= SPLIT-VIEW REVIEW PANEL ================= */}
      {selectedApplicantId && (
        <div>
          {dossierLoading || !dossier ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
              <LogoLoader />
              <p className="text-xs text-ink-3">
                Compiling applicant dossier & assessment records...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sticky Action Banner */}
              <div className="bg-surface/95 sticky top-2 z-10 flex flex-col gap-3 rounded-2xl border border-line p-4 shadow-md backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-indigo/10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-brand-indigo">
                    {dossier.user?.name?.[0] || "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">
                        {dossier.user?.name}
                      </span>
                      {getStatusBadge(dossier.status)}
                      {getSlaBadge(dossier.slaDeadline, dossier.status)}
                    </div>
                    <p className="text-2xs text-ink-3">
                      {dossier.user?.email} • {dossier.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setActionModal("REJECT");
                      setActionReason("");
                    }}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      setActionModal("REQUEST_CHANGES");
                      setActionReason("");
                    }}
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Request Changes
                  </Button>

                  <Button
                    size="sm"
                    className="shadow-xs bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                    onClick={() => {
                      setActionModal("APPROVE");
                      setActionReason(
                        "Met technical benchmark and validated production case studies."
                      );
                    }}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve &
                    Verify
                  </Button>
                </div>
              </div>

              {/* Two-Column Split View */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* LEFT COLUMN: Profile, Positioning, Case Studies (6 cols) */}
                <div className="space-y-6 lg:col-span-6">
                  {/* Bio & Positioning */}
                  <div className="bg-surface shadow-xs space-y-4 rounded-2xl border border-line p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                      Candidate Profile & Positioning
                    </h2>
                    <div>
                      <h3 className="text-base font-semibold text-ink">
                        {dossier.headline}
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-ink-2">
                        {dossier.bio}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 text-xs">
                      <div>
                        <span className="text-ink-4">Timezone</span>
                        <div className="font-medium text-ink">
                          {dossier.timezone}
                        </div>
                      </div>
                      <div>
                        <span className="text-ink-4">Experience</span>
                        <div className="font-medium text-ink">
                          {dossier.yearsExperience} Years
                        </div>
                      </div>
                      <div>
                        <span className="text-ink-4">Hourly Rate</span>
                        <div className="font-medium text-ink">
                          ${dossier.hourlyRateMin} - ${dossier.hourlyRateMax}/hr
                        </div>
                      </div>
                      <div>
                        <span className="text-ink-4">Monthly Retainer</span>
                        <div className="font-medium text-ink">
                          ${dossier.retainerMin} - ${dossier.retainerMax}/mo
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3 border-t border-line pt-4 text-xs">
                      {dossier.linkedinUrl && (
                        <a
                          href={dossier.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-brand-indigo hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> LinkedIn Profile
                        </a>
                      )}
                      {dossier.githubUrl && (
                        <a
                          href={dossier.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-brand-indigo hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> GitHub /
                          Portfolio
                        </a>
                      )}
                      {dossier.website && (
                        <a
                          href={dossier.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-brand-indigo hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Skills & Specializations */}
                  <div className="bg-surface shadow-xs space-y-4 rounded-2xl border border-line p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                      Skills & Proficiency Benchmarks
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {dossier.skills?.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs"
                        >
                          <span className="font-medium text-ink">
                            {s.skill.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-brand-indigo/30 text-2xs font-bold text-brand-indigo"
                          >
                            Level {s.level}/5
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Case Studies */}
                  <div className="bg-surface shadow-xs space-y-4 rounded-2xl border border-line p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                        Verified Case Studies (
                        {dossier.caseStudies?.length || 0})
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {dossier.caseStudies?.map((cs, idx) => (
                        <div
                          key={cs.id || idx}
                          className="space-y-3 rounded-xl border border-line bg-canvas p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">
                              {idx + 1}. {cs.title}
                            </span>
                            <div className="flex items-center gap-2">
                              {cs.isConfidential && (
                                <Badge
                                  variant="outline"
                                  className="text-2xs text-ink-3"
                                >
                                  <Lock className="mr-1 h-2.5 w-2.5" />{" "}
                                  Confidential
                                </Badge>
                              )}
                              <Badge className="border border-emerald-300 bg-emerald-50 text-2xs text-emerald-700">
                                {cs.outcomeNumber} {cs.outcomeUnit}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-2xs text-ink-3">
                            <span className="font-semibold text-ink-2">
                              Client Type:
                            </span>{" "}
                            {cs.clientType}
                          </div>

                          <div className="space-y-1 text-xs leading-relaxed text-ink">
                            <p>
                              <strong className="text-ink-2">Problem:</strong>{" "}
                              {cs.problem}
                            </p>
                            <p>
                              <strong className="text-ink-2">Approach:</strong>{" "}
                              {cs.approach}
                            </p>
                          </div>

                          {cs.proofUrl && (
                            <a
                              href={cs.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-2xs text-brand-indigo hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> View Artifact
                              / Proof
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Skills Assessment Answers & AI Rubric (6 cols) */}
                <div className="space-y-6 lg:col-span-6">
                  {(() => {
                    const attempts = dossier.assessmentAttempts || [];
                    const latestAttempt = attempts[0];

                    if (!latestAttempt) {
                      return (
                        <div className="bg-surface shadow-xs rounded-2xl border border-line p-8 text-center">
                          <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
                          <h3 className="mt-2 text-sm font-semibold text-ink">
                            No Assessment Attempt Yet
                          </h3>
                          <p className="text-xs text-ink-3">
                            The strategist has not completed the timed scenario
                            assessment.
                          </p>
                        </div>
                      );
                    }

                    const questions = latestAttempt.assessment?.questions || [];
                    const candidateAnswers = latestAttempt.answers || {};
                    const aiEvals = latestAttempt.aiEvaluations || {};

                    return (
                      <div className="space-y-6">
                        {/* Score Summary Box */}
                        <div className="bg-surface shadow-xs rounded-2xl border border-line p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-ink-4 text-2xs font-bold uppercase tracking-wider">
                                Timed Scenario Benchmark
                              </span>
                              <h3 className="text-lg font-bold text-ink">
                                Score: {latestAttempt.score}%
                              </h3>
                              <p className="text-xs text-ink-3">
                                Evaluated via AI Rubric v
                                {latestAttempt.rubricVersion || "1.0"}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge
                                className={
                                  latestAttempt.passed
                                    ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                                    : "border border-amber-300 bg-amber-50 text-amber-800"
                                }
                              >
                                {latestAttempt.passed
                                  ? "Passed Threshold"
                                  : "Pending Benchmark"}
                              </Badge>
                            </div>
                          </div>

                          {/* Quick override */}
                          <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                            <span className="text-xs text-ink-3">
                              Human Calibrated Score:
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              defaultValue={latestAttempt.score || 0}
                              className="w-16 rounded border border-line bg-canvas px-2 py-1 text-xs font-semibold text-ink"
                              id="adminManualScoreInput"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const input = document.getElementById(
                                  "adminManualScoreInput"
                                );
                                if (input) {
                                  handleScoreOverride(
                                    latestAttempt.id,
                                    parseFloat(input.value) || 0
                                  );
                                }
                              }}
                            >
                              Override Score
                            </Button>
                          </div>
                        </div>

                        {/* Questions & Answer Cards */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                            Candidate Responses & Rubric Scoring (
                            {questions.length} Questions)
                          </h3>

                          {questions.map((q, idx) => {
                            const candidateAns = candidateAnswers[q.id];
                            const aiEval = aiEvals[q.id];

                            return (
                              <div
                                key={q.id || idx}
                                className="bg-surface shadow-xs space-y-3 rounded-xl border border-line p-5"
                              >
                                <div className="flex items-center justify-between border-b border-line pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-ink">
                                      Q{idx + 1}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="border-brand-indigo/30 text-2xs text-brand-indigo"
                                    >
                                      {q.domain || "AI Architecture"}
                                    </Badge>
                                  </div>
                                  {aiEval && (
                                    <Badge
                                      variant="outline"
                                      className="border-emerald-300 bg-emerald-50 text-2xs font-bold text-emerald-700"
                                    >
                                      Rubric Score: {aiEval.score} /{" "}
                                      {aiEval.maxScore || 5}
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-xs font-semibold leading-snug text-ink">
                                  {q.prompt}
                                </p>

                                {/* Candidate Answer */}
                                <div className="rounded-lg border border-line bg-canvas p-3 text-xs">
                                  <span className="font-semibold text-ink-2">
                                    Candidate Response:{" "}
                                  </span>
                                  {Array.isArray(candidateAns) ? (
                                    <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-ink-2">
                                      {candidateAns.map((item, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ol>
                                  ) : (
                                    <span className="leading-relaxed text-ink">
                                      {candidateAns || (
                                        <em className="text-ink-4">
                                          No answer provided
                                        </em>
                                      )}
                                    </span>
                                  )}
                                </div>

                                {/* AI Rubric Feedback */}
                                {aiEval && (
                                  <div className="border-brand-orange/20 bg-brand-orange/5 space-y-1 rounded-lg border p-3 text-xs">
                                    <div className="text-brand-orange flex items-center gap-1 text-2xs font-bold uppercase">
                                      <Sparkles className="h-3 w-3" />
                                      <span>AI Rubric Rationale</span>
                                    </div>
                                    <p className="leading-relaxed text-ink-2">
                                      {aiEval.rationale}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface w-full max-w-lg space-y-4 rounded-2xl border border-line p-6 shadow-xl">
            <h3 className="text-base font-bold text-ink">
              {actionModal === "APPROVE" &&
                "Approve Strategist & Issue Verification Badge"}
              {actionModal === "REQUEST_CHANGES" &&
                "Request Changes & Unlock Wizard Steps"}
              {actionModal === "REJECT" && "Reject Strategist Application"}
            </h3>

            <p className="text-xs text-ink-3">
              This action executes state machine transitions, records an audit
              log entry, and delivers a templated notification email to{" "}
              {dossier?.user?.email}.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-ink-3">
                Reason / Templated Message
              </label>
              <Textarea
                rows={4}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Provide specific architectural guidance, missing case study proof, or approval comments..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-ink-3">
                Internal Reviewer Notes (Admissions Team Only)
              </label>
              <Input
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="e.g. Verified GitHub repo, high competency on LangGraph multi-agent."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => setActionModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(actionModal)}
                disabled={actionLoading}
                className={
                  actionModal === "APPROVE"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : actionModal === "REJECT"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                }
              >
                {actionLoading
                  ? "Processing..."
                  : `Confirm ${actionModal.replace("_", " ")}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
