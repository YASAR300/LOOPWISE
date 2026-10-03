"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function NewProposalPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [scope, setScope] = useState("");
  const [fixedFee, setFixedFee] = useState("15000");
  const [estimatedWeeks, setEstimatedWeeks] = useState("4");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Proposal submitted successfully!",
        description:
          "The enterprise client has been notified to review your scope and milestones.",
      });
      router.push("/strategist/proposals");
    }, 600);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/strategist/proposals"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to proposals</span>
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Draft a New Proposal
        </h1>
        <p className="text-xs text-ink-3">
          Define your fractional engagement scope, milestones, and escrow payout
          terms.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shadow-2xs space-y-6 rounded-2xl border border-line bg-panel p-6 sm:p-8"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Target Client / Project
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. CareWave Health or Apex Advisory"
            className="input-base w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Scope of Automation & Deliverables
          </label>
          <textarea
            rows={4}
            required
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Outline workflow mapping phases, agent tools, integrations, and testing criteria..."
            className="input-base w-full py-2.5 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              Total Milestone Escrow ($ USD)
            </label>
            <input
              type="number"
              required
              value={fixedFee}
              onChange={(e) => setFixedFee(e.target.value)}
              className="input-base w-full font-mono font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              Engagement Duration (Weeks)
            </label>
            <input
              type="number"
              required
              value={estimatedWeeks}
              onChange={(e) => setEstimatedWeeks(e.target.value)}
              className="input-base w-full font-mono font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Link
            href="/strategist/proposals"
            className="rounded-lg px-4 py-2 text-xs font-medium text-ink-3 hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Submitting..." : "Send Proposal"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
