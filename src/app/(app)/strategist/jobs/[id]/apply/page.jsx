"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  Paperclip,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function ProposalComposerPage({ params }) {
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [coverLetter, setCoverLetter] = useState("");
  const [previewTab, setPreviewTab] = useState("write"); // "write" | "preview"
  const [proposedModel, setProposedModel] = useState("RETAINER");
  const [proposedRate, setProposedRate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("20");
  const [startDate, setStartDate] = useState("");
  const [milestones, setMilestones] = useState([
    { title: "Architecture & Tooling Audit", amount: 3000, dueDate: "" },
    { title: "Prototype Workflow Agents", amount: 5000, dueDate: "" },
  ]);
  const [screeningAnswers, setScreeningAnswers] = useState({});

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/strategist/jobs/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Job not found");
      setJob(data.job);
      setProposedRate(data.job.budget || 5000);
      setProposedModel(data.job.model || "RETAINER");
      setHoursPerWeek(String(data.job.hoursPerWeek || 20));
      setStartDate(
        new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10)
      );

      // Prefill screening question keys
      if (Array.isArray(data.job.screeningQuestions)) {
        const answers = {};
        data.job.screeningQuestions.forEach((q, idx) => {
          answers[idx] = "";
        });
        setScreeningAnswers(answers);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        title: `Milestone Phase ${prev.length + 1}`,
        amount: 2500,
        dueDate: "",
      },
    ]);
  };

  const handleRemoveMilestone = (index) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      toast.warning("Please provide a cover note detailing your approach.");
      return;
    }
    if (!proposedRate) {
      toast.warning("Please enter your proposed rate or retainer.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/strategist/jobs/${jobId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter,
          proposedRate: parseFloat(proposedRate),
          proposedModel,
          hoursPerWeek: parseInt(hoursPerWeek, 10) || 20,
          startDate,
          milestones: proposedModel === "FIXED" ? milestones : [],
          screeningAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit proposal");

      toast.success("Proposal submitted successfully!");
      router.push("/strategist/proposals");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-ink-3">
        Loading proposal composer...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-16 text-center text-xs text-red-500">
        Job not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/strategist/jobs"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-panel text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Submit Proposal
            </h1>
            <p className="text-xs text-ink-3">
              Applying to: <strong className="text-ink">{job.title}</strong> (
              {job.organization.name})
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Commercials Section */}
        <div className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-6">
          <h2 className="text-sm font-bold text-ink">
            1. Commercial Terms & Model
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">
                Engagement Model:
              </label>
              <select
                value={proposedModel}
                onChange={(e) => setProposedModel(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              >
                <option value="RETAINER">Monthly Retainer</option>
                <option value="HOURLY">Hourly Billing</option>
                <option value="FIXED">Fixed Scope Milestones</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">
                {proposedModel === "HOURLY"
                  ? "Proposed Rate ($/hr):"
                  : proposedModel === "RETAINER"
                    ? "Proposed Retainer ($/month):"
                    : "Total Fixed Budget ($):"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-ink-3">
                  $
                </span>
                <input
                  type="number"
                  required
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-canvas py-2 pl-7 pr-3 font-mono text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">
                Hours / Week Needed:
              </label>
              <input
                type="number"
                min="5"
                max="40"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas px-3 py-2 font-mono text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              />
            </div>
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">
                Estimated Earliest Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              />
            </div>
          </div>
        </div>

        {/* Milestone Plan (for Fixed scope or structured deliverables) */}
        {proposedModel === "FIXED" && (
          <div className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Milestone Deliverable Plan
                </h2>
                <p className="text-2xs text-ink-3">
                  Structured payout phases released upon client acceptance
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-2xs font-semibold text-brand-indigo hover:bg-panel-2"
              >
                <Plus className="h-3 w-3" />
                <span>Add Phase</span>
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-line bg-panel-2 p-2.5 text-xs"
                >
                  <span className="w-6 font-mono text-2xs font-bold text-ink-3">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) =>
                      handleMilestoneChange(idx, "title", e.target.value)
                    }
                    placeholder="Milestone description..."
                    className="flex-1 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-2xs font-bold text-ink-3">
                      $
                    </span>
                    <input
                      type="number"
                      value={m.amount}
                      onChange={(e) =>
                        handleMilestoneChange(
                          idx,
                          "amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-lg border border-line bg-canvas py-1.5 pl-6 pr-2 font-mono text-xs font-bold text-ink focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-1 text-ink-3 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screening Questions (if required by job) */}
        {Array.isArray(job.screeningQuestions) &&
          job.screeningQuestions.length > 0 && (
            <div className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-6">
              <h2 className="text-sm font-bold text-ink">
                2. Client Screening Questions
              </h2>
              <div className="space-y-3">
                {job.screeningQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="block text-xs font-semibold text-ink">
                      {idx + 1}. {q}
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={screeningAnswers[idx] || ""}
                      onChange={(e) =>
                        setScreeningAnswers((prev) => ({
                          ...prev,
                          [idx]: e.target.value,
                        }))
                      }
                      placeholder="Your specific answer..."
                      className="w-full rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Cover Letter with Markdown Editor & Preview */}
        <div className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink">
                3. Strategy & Pitch (Cover Note)
              </h2>
              <p className="text-2xs text-ink-3">
                Explain your proposed architecture, tools, and execution roadmap
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 p-0.5 text-2xs">
              <button
                type="button"
                onClick={() => setPreviewTab("write")}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                  previewTab === "write"
                    ? "shadow-2xs bg-panel text-ink"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                Write (Markdown)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("preview")}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                  previewTab === "preview"
                    ? "shadow-2xs bg-panel text-ink"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {previewTab === "write" ? (
            <textarea
              rows={8}
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Hi team, I reviewed your workflow requirements and here is how I will approach orchestrating this autonomous pipeline..."
              className="w-full rounded-xl border border-line bg-canvas p-3 font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            />
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-xl border border-line bg-panel-2 p-4 text-xs leading-relaxed text-ink">
              {coverLetter || "*Nothing written yet.*"}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
          <Link
            href="/strategist/jobs"
            className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-ink-3 hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary-orange shadow-xs flex items-center gap-1.5 px-6 py-2 text-xs font-bold disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              {submitting ? "Submitting Proposal..." : "Submit Proposal"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
