// src/components/engagements/money-tab.jsx
"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Plus,
  ArrowRight,
  DollarSign,
  FileCheck2,
  HelpCircle,
  RefreshCw,
  Send,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MoneyTab({
  engagement,
  milestones = [],
  userRole,
  isClosed,
  onRefresh,
}) {
  const [fundingLoading, setFundingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(null); // milestone object
  const [showDisputeModal, setShowDisputeModal] = useState(null); // milestone object

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [workNotes, setWorkNotes] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  const isClient = userRole === "CLIENT";
  const isStrategist = userRole === "STRATEGIST";

  // Calculate totals
  const totalInEscrow = milestones
    .filter((m) => m.status === "IN_ESCROW" || m.status === "SUBMITTED")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalReleased = milestones
    .filter((m) => m.status === "RELEASED")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalPendingFunding = milestones
    .filter((m) => m.status === "PENDING")
    .reduce((sum, m) => sum + m.amount, 0);

  // Client initiates Stripe Checkout funding
  const handleFundMilestone = async (milestoneId) => {
    try {
      setFundingLoading(true);
      setErrorMsg("");

      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MILESTONE",
          milestoneId,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to create checkout session");

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setErrorMsg(err.message);
      setFundingLoading(false);
    }
  };

  // Strategist submits milestone deliverables
  const handleSubmitMilestone = async (e) => {
    e.preventDefault();
    if (!showSubmitModal) return;

    try {
      setActionLoading(true);
      setErrorMsg("");

      const res = await fetch(
        `/api/engagements/${engagement.id}/milestones/${showSubmitModal.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SUBMIT",
            workNotes,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit milestone");

      setSuccessMsg("Milestone submitted for client review!");
      setShowSubmitModal(null);
      setWorkNotes("");
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Client approves milestone and releases escrow
  const handleApproveMilestone = async (milestoneId) => {
    if (
      !confirm(
        "Are you sure you want to approve this milestone and release escrow funds?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg("");

      const res = await fetch(
        `/api/engagements/${engagement.id}/milestones/${milestoneId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "APPROVE" }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve milestone");

      setSuccessMsg("Milestone approved! Funds released to strategist.");
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Create new milestone
  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setErrorMsg("");

      const res = await fetch(`/api/engagements/${engagement.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          amount: parseFloat(newAmount),
          dueDate: newDueDate || null,
          description: newDesc.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create milestone");

      setShowAddModal(false);
      setNewTitle("");
      setNewAmount("");
      setNewDueDate("");
      setNewDesc("");
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN_ESCROW":
      case "FUNDED":
        return (
          <Badge className="gap-1 border-purple-500/30 bg-purple-500/10 text-xs text-purple-400">
            <Lock className="h-3 w-3" /> Funded in Escrow
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge className="gap-1 border-amber-500/30 bg-amber-500/10 text-xs text-amber-400">
            <Clock className="h-3 w-3" /> In Review
          </Badge>
        );
      case "RELEASED":
      case "APPROVED":
        return (
          <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Escrow Released
          </Badge>
        );
      case "DISPUTED":
        return (
          <Badge className="gap-1 border-rose-500/30 bg-rose-500/10 text-xs text-rose-400">
            <Scale className="h-3 w-3" /> Disputed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            Awaiting Funding
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Escrow Guarantee Banner */}
      <div className="from-primary/10 via-card to-card border-primary/20 flex flex-col justify-between gap-4 rounded-2xl border bg-gradient-to-r p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-start gap-3.5">
          <div className="bg-primary/20 shrink-0 rounded-xl p-3 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-foreground text-base font-bold">
                Loopwise Escrow Protection & Guarantee
              </h3>
              <Badge
                variant="outline"
                className="border-primary/30 bg-background font-mono text-[11px] text-primary"
              >
                100% Protected
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed">
              Client funds are held safely in Stripe-backed double-entry escrow
              before work starts. Strategists are guaranteed payout upon
              deliverable review, and clients retain full 14-day replacement
              guarantees.
            </p>
          </div>
        </div>

        {!isClosed && (
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-primary-foreground shrink-0 gap-2 bg-primary text-xs"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card/60 border-border/60 space-y-1 rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Lock className="h-3.5 w-3.5 text-purple-400" />
            <span>Locked in Escrow</span>
          </div>
          <div className="text-foreground font-mono text-2xl font-bold">
            ${totalInEscrow.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-[11px]">
            Secured for in-progress or review deliverables
          </p>
        </div>

        <div className="bg-card/60 border-border/60 space-y-1 rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Unlock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Released to Strategist</span>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            ${totalReleased.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-[11px]">
            Approved milestones completed & settled
          </p>
        </div>

        <div className="bg-card/60 border-border/60 space-y-1 rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5 text-amber-400" />
            <span>Pending Client Funding</span>
          </div>
          <div className="text-foreground font-mono text-2xl font-bold">
            ${totalPendingFunding.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-[11px]">
            Planned milestones awaiting Stripe checkout
          </p>
        </div>
      </div>

      {/* Milestones Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-base font-bold">
            Milestone Escrow Pipeline
          </h3>
          <span className="text-muted-foreground font-mono text-xs">
            {milestones.length}{" "}
            {milestones.length === 1 ? "Milestone" : "Milestones"}
          </span>
        </div>

        {milestones.length === 0 ? (
          <div className="border-border/80 bg-card/20 space-y-3 rounded-2xl border border-dashed p-12 text-center">
            <Lock className="text-muted-foreground/40 mx-auto h-10 w-10" />
            <h4 className="text-foreground text-sm font-semibold">
              No milestones created yet
            </h4>
            <p className="text-muted-foreground mx-auto max-w-sm text-xs">
              Create deliverable milestones with agreed amounts to activate
              escrow protection.
            </p>
            {!isClosed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddModal(true)}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add First Milestone
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => {
              const isFunded =
                m.status === "IN_ESCROW" || m.status === "FUNDED";
              const isSubmitted = m.status === "SUBMITTED";
              const isReleased = m.status === "RELEASED";

              return (
                <div
                  key={m.id}
                  className="bg-card/60 hover:bg-card/90 border-border/60 flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm transition-all md:flex-row md:items-center"
                >
                  <div className="max-w-xl space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-foreground text-sm font-bold">
                        {m.title}
                      </h4>
                      {getStatusBadge(m.status)}
                    </div>

                    {m.description && (
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {m.description}
                      </p>
                    )}

                    <div className="text-muted-foreground flex flex-wrap items-center gap-4 pt-1 font-mono text-xs">
                      <span>
                        Amount:{" "}
                        <strong className="text-foreground">
                          ${m.amount.toLocaleString()}
                        </strong>
                      </span>
                      {m.dueDate && (
                        <span>
                          Due: {new Date(m.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {m.autoReleaseAt && isSubmitted && (
                        <span className="text-amber-400">
                          Auto-releases:{" "}
                          {new Date(m.autoReleaseAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {m.workNotes && (
                      <div className="bg-muted/30 border-border/40 text-muted-foreground mt-2 rounded-lg border p-2.5 text-xs">
                        <strong className="text-foreground">
                          Strategist Notes:
                        </strong>{" "}
                        {m.workNotes}
                      </div>
                    )}
                  </div>

                  {/* Role-Specific Actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                    {/* CLIENT ACTIONS */}
                    {isClient && !isClosed && (
                      <>
                        {m.status === "PENDING" && (
                          <Button
                            size="sm"
                            disabled={fundingLoading}
                            onClick={() => handleFundMilestone(m.id)}
                            className="text-primary-foreground gap-1.5 bg-primary text-xs font-semibold shadow-sm"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Fund into Escrow
                          </Button>
                        )}

                        {isSubmitted && (
                          <>
                            <Button
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => handleApproveMilestone(m.id)}
                              className="gap-1.5 bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve & Release
                            </Button>
                          </>
                        )}
                      </>
                    )}

                    {/* STRATEGIST ACTIONS */}
                    {isStrategist && !isClosed && (
                      <>
                        {isFunded && (
                          <Button
                            size="sm"
                            onClick={() => setShowSubmitModal(m)}
                            className="text-primary-foreground gap-1.5 bg-primary text-xs font-semibold shadow-sm"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Submit Deliverables
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="bg-background/80 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-2xl">
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <Plus className="h-5 w-5 text-primary" />
                Add Escrow Milestone
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Milestone Title *
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. n8n AP Automation Swarm Deployment"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Amount ($ USD) *
                  </label>
                  <Input
                    type="number"
                    min="100"
                    step="50"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="2500"
                    required
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Target Due Date
                  </label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Scope & Acceptance Criteria
                </label>
                <Textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe specific outputs, pull requests, or benchmark metrics required for release..."
                  rows={3}
                />
              </div>

              <div className="border-border/60 flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading}
                  className="text-primary-foreground bg-primary"
                >
                  {actionLoading ? "Saving..." : "Create Milestone"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Deliverables Modal (Strategist) */}
      {showSubmitModal && (
        <div className="bg-background/80 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-lg space-y-4 rounded-2xl border p-6 shadow-2xl">
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <Send className="h-5 w-5 text-primary" />
                Submit Milestone Work
              </h3>
              <button
                onClick={() => setShowSubmitModal(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMilestone} className="space-y-4">
              <div className="bg-muted/30 border-border/40 space-y-1 rounded-xl border p-3 text-xs">
                <div className="text-foreground font-semibold">
                  {showSubmitModal.title}
                </div>
                <div className="font-mono font-bold text-primary">
                  ${showSubmitModal.amount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Deliverable Summary & Access Instructions *
                </label>
                <Textarea
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  placeholder="Summarize the completed workflows, links to GitHub repo/PRs, credentials location, or loom walkthrough..."
                  rows={4}
                  required
                />
              </div>

              <p className="text-muted-foreground text-[11px]">
                Upon submission, the client has 7 calendar days to review and
                approve. Funds auto-release if no changes or disputes are filed.
              </p>

              <div className="border-border/60 flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubmitModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading}
                  className="text-primary-foreground gap-2 bg-primary"
                >
                  {actionLoading ? "Submitting..." : "Submit for Approval"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
