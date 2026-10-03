"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Calendar,
  Briefcase,
  Sparkles,
  Layers,
  ChevronRight,
  CreditCard,
  Check,
  X,
  Send,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function StrategistDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [introActionLoading, setIntroActionLoading] = useState({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/strategist/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStripeConnect = async () => {
    try {
      setStripeLoading(true);
      const res = await fetch("/api/strategist/stripe-connect", {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          window.location.href = json.url;
        }
      }
    } catch (err) {
      console.error("Stripe connect failed", err);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleIntroAction = async (introId, action) => {
    try {
      setIntroActionLoading((prev) => ({ ...prev, [introId]: true }));
      const res = await fetch("/api/strategist/intros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ introId, action }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Intro action failed", err);
    } finally {
      setIntroActionLoading((prev) => ({ ...prev, [introId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Loading strategist workspace...
        </p>
      </div>
    );
  }

  const profile = data?.profile;
  const completeness = data?.completeness || {
    score: 100,
    isComplete: true,
    missing: [],
  };
  const assessment = data?.assessment;
  const intros = data?.intros || [];
  const invitations = data?.invitations || [];
  const earnings = data?.earnings || { totalEarned: 0, pendingAmount: 0 };

  // SLA Hours calculation
  let slaRemainingHours = null;
  if (profile?.slaDeadline) {
    const diff = new Date(profile.slaDeadline) - new Date();
    slaRemainingHours = Math.max(0, Math.round(diff / (1000 * 60 * 60)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* 1. VETTING STATUS & SLA BANNER */}
      {profile?.status === "DRAFT" && (
        <div className="border-brand-orange/30 bg-brand-orange/5 shadow-xs flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-brand-orange/10 text-brand-orange flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-brand-orange/30 text-brand-orange font-bold"
                >
                  Onboarding Draft
                </Badge>
                <span className="text-xs font-semibold text-ink">
                  {completeness.score}% Completed
                </span>
              </div>
              <h2 className="mt-1 text-base font-bold text-ink">
                Complete your Admissions Application
              </h2>
              <p className="text-xs text-ink-3">
                Complete your profile and case studies to enter our transparent
                48-hour vetting pipeline.
              </p>
            </div>
          </div>
          <Link href="/strategist/onboarding">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 shadow-xs font-semibold text-white">
              Continue Wizard (Step {profile.onboardingStep || 1}){" "}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {profile?.status === "SUBMITTED" && (
        <div className="border-brand-indigo/30 bg-brand-indigo/5 shadow-xs flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-brand-indigo/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-indigo">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-brand-indigo font-semibold text-white">
                  Submitted • In Vetting Queue
                </Badge>
                {slaRemainingHours !== null && (
                  <Badge
                    variant="outline"
                    className="border-brand-indigo/30 font-bold text-brand-indigo"
                  >
                    <Clock className="mr-1 h-3 w-3" /> {slaRemainingHours}h SLA
                    Countdown
                  </Badge>
                )}
              </div>
              <h2 className="mt-1 text-base font-bold text-ink">
                Technical Review in Progress
              </h2>
              <p className="text-xs text-ink-3">
                Admissions committee is validating your case study metrics.
                Ensure you take the scenario benchmark.
              </p>
            </div>
          </div>
          <Link href="/strategist/assessment">
            <Button className="hover:bg-brand-indigo/90 bg-brand-indigo font-semibold text-white">
              Take Skills Assessment <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {profile?.status === "IN_REVIEW" && (
        <div className="border-brand-indigo/30 bg-brand-indigo/5 shadow-xs flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-brand-indigo/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-indigo">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-brand-indigo/20 border-brand-indigo/30 border font-semibold text-brand-indigo">
                  Reviewer Assigned
                </Badge>
                {assessment && (
                  <Badge
                    variant="outline"
                    className="border-emerald-300 bg-emerald-50 font-bold text-emerald-700"
                  >
                    Assessment: {assessment.score}%
                  </Badge>
                )}
              </div>
              <h2 className="mt-1 text-base font-bold text-ink">
                Admissions Decision Pending
              </h2>
              <p className="text-xs text-ink-3">
                Your technical benchmark and architecture answers are currently
                undergoing calibration.
              </p>
            </div>
          </div>
          <Link href="/strategist/assessment">
            <Button variant="outline" className="bg-surface border-line">
              View Assessment Score
            </Button>
          </Link>
        </div>
      )}

      {profile?.status === "APPROVED" && (
        <div className="shadow-xs flex flex-col gap-4 rounded-2xl border border-emerald-300 bg-emerald-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 font-semibold text-white">
                  Verified Fractional Head of AI
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-300 text-emerald-800"
                >
                  Top 3% Talent Network
                </Badge>
              </div>
              <h2 className="mt-1 text-base font-bold text-ink">
                Your Profile is Live & Discoverable
              </h2>
              <p className="text-xs text-ink-3">
                Clients can discover your case studies, send intro requests, and
                invite you to fractional mandates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/strategist/profile">
              <Button
                size="sm"
                variant="outline"
                className="bg-surface border-emerald-200 text-emerald-800"
              >
                Edit Profile
              </Button>
            </Link>
            <Link href="/strategists">
              <Button
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                View in Directory <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {profile?.status === "REJECTED" && (
        <div className="shadow-xs flex flex-col gap-4 rounded-2xl border border-red-300 bg-red-50/80 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <Badge className="bg-red-600 font-semibold text-white">
                Changes Requested
              </Badge>
              <h2 className="mt-1 text-base font-bold text-ink">
                Admissions Feedback Provided
              </h2>
              <p className="mt-1 text-xs font-medium leading-relaxed text-red-800">
                {profile.rejectionReason ||
                  "Please update your case study metrics and re-submit for review."}
              </p>
            </div>
          </div>
          <Link href="/strategist/onboarding">
            <Button className="bg-red-600 text-white hover:bg-red-700">
              Update Application <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* 2. STRIPE PAYOUTS BANNER (IF NOT CONNECTED) */}
      {!profile?.stripeOnboarded && (
        <div className="bg-surface shadow-xs flex flex-col gap-3 rounded-2xl border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="border-brand-indigo/20 bg-brand-indigo/10 flex h-10 w-10 items-center justify-center rounded-xl border text-brand-indigo">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">
                Set up Stripe Connect Payouts
              </h3>
              <p className="text-xs text-ink-3">
                Connect your bank account to receive automated milestone
                releases and retainer disbursements.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleStripeConnect}
            disabled={stripeLoading}
            className="hover:bg-brand-indigo/90 bg-brand-indigo"
          >
            {stripeLoading ? "Connecting..." : "Connect Stripe Express"}
          </Button>
        </div>
      )}

      {/* 3. CORE METRICS & ZERO-STATE LEDGER */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-surface shadow-xs space-y-1 rounded-2xl border border-line p-5">
          <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
            Total Net Earnings
          </span>
          <div className="text-2xl font-bold text-ink">
            $
            {earnings.totalEarned.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-2xs text-ink-3">
            Direct deposits via Stripe Connect
          </p>
        </div>

        <div className="bg-surface shadow-xs space-y-1 rounded-2xl border border-line p-5">
          <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
            Escrow & Pending Transfers
          </span>
          <div className="text-2xl font-bold text-brand-indigo">
            $
            {earnings.pendingAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-2xs text-ink-3">
            Funded by clients awaiting milestone approval
          </p>
        </div>

        <div className="bg-surface shadow-xs space-y-1 rounded-2xl border border-line p-5">
          <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
            Profile Completeness
          </span>
          <div className="text-2xl font-bold text-emerald-600">
            {completeness.score}%
          </div>
          <p className="text-2xs text-ink-3">
            {completeness.isComplete
              ? "All 7 onboarding sections verified"
              : "Some items pending completion"}
          </p>
        </div>
      </div>

      {/* 4. INTRO REQUESTS INBOX & INVITATIONS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Intro Requests Inbox (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-indigo" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Intro Requests Inbox ({intros.length})
              </h2>
            </div>
          </div>

          {intros.length === 0 ? (
            <div className="bg-surface shadow-xs rounded-2xl border border-line p-8 text-center">
              <Calendar className="text-ink-4 mx-auto h-8 w-8" />
              <h3 className="mt-2 text-sm font-semibold text-ink">
                No Intro Requests Yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
                When enterprise clients discover your profile in the directory,
                their 30-minute intro requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {intros.map((req) => (
                <div
                  key={req.id}
                  className="bg-surface shadow-xs space-y-3 rounded-2xl border border-line p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">
                          {req.organization?.name || "Enterprise Client"}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            req.status === "ACCEPTED"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : req.status === "DECLINED"
                                ? "text-ink-4 border-line"
                                : "border-brand-indigo/30 bg-brand-indigo/5 text-brand-indigo"
                          }
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-2xs text-ink-3">
                        Requested for{" "}
                        {new Date(req.requestedDate).toLocaleDateString()} at{" "}
                        {new Date(req.requestedDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • 30 mins
                      </p>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={introActionLoading[req.id]}
                          onClick={() => handleIntroAction(req.id, "DECLINE")}
                          className="h-8 border-line text-ink-3 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" /> Decline
                        </Button>
                        <Button
                          size="sm"
                          disabled={introActionLoading[req.id]}
                          onClick={() => handleIntroAction(req.id, "ACCEPT")}
                          className="hover:bg-brand-indigo/90 h-8 bg-brand-indigo"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Accept
                        </Button>
                      </div>
                    )}
                  </div>

                  {req.notes && (
                    <div className="rounded-xl border border-line bg-canvas p-3 text-xs leading-relaxed text-ink-2">
                      <strong className="text-ink">Client Note: </strong>
                      {req.notes}
                    </div>
                  )}

                  {req.meetUrl && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-brand-indigo">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <a
                        href={req.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        Join Meeting Room
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matched Job Invitations (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="text-brand-orange h-4 w-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Job Invitations & Matches
              </h2>
            </div>
          </div>

          {invitations.length === 0 ? (
            <div className="bg-surface shadow-xs rounded-2xl border border-line p-8 text-center">
              <Briefcase className="text-ink-4 mx-auto h-8 w-8" />
              <h3 className="mt-2 text-sm font-semibold text-ink">
                No Job Invitations Yet
              </h3>
              <p className="mx-auto mt-1 max-w-xs text-xs text-ink-3">
                Enterprise AI briefs matching your skill taxonomy will be
                dispatched here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-surface shadow-xs space-y-2 rounded-2xl border border-line p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">
                      {inv.brief?.title ||
                        inv.job?.title ||
                        "Fractional Mandate"}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-brand-orange/30 text-brand-orange text-2xs font-bold"
                    >
                      {Math.round(inv.score || 95)}% Match
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-2xs text-ink-3">
                    {inv.brief?.problemDescription || inv.explanation}
                  </p>
                  <div className="flex justify-end pt-1">
                    <Link href={`/strategist/jobs`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-brand-indigo"
                      >
                        View Brief <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
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
