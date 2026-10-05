// src/app/(app)/strategist/earnings/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  Send,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function StrategistEarningsPage() {
  const [balanceData, setBalanceData] = useState({
    balanceCents: 0,
    balanceFormatted: "$0.00",
    minimumThresholdFormatted: "$50.00",
    stripeAccountId: null,
    stripeOnboarded: false,
    payouts: [],
  });

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payoutsRes, invoicesRes] = await Promise.all([
        fetch("/api/strategist/payouts"),
        fetch("/api/invoices"),
      ]);

      if (payoutsRes.ok) {
        const pData = await payoutsRes.json();
        setBalanceData(pData);
      }

      if (invoicesRes.ok) {
        const iData = await invoicesRes.json();
        setInvoices(iData.invoices || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    const dollars = parseFloat(withdrawAmount);
    if (isNaN(dollars) || dollars < 50) {
      setWithdrawError("Minimum withdrawal amount is $50.00.");
      return;
    }

    const cents = Math.round(dollars * 100);
    if (cents > balanceData.balanceCents) {
      setWithdrawError(
        `Requested amount exceeds available balance of ${balanceData.balanceFormatted}.`
      );
      return;
    }

    try {
      setWithdrawLoading(true);
      const res = await fetch("/api/strategist/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: cents }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");

      setWithdrawSuccess(
        `Payout of $${dollars.toFixed(2)} sent via Stripe Connect!`
      );
      setWithdrawAmount("");
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawSuccess("");
        fetchData();
      }, 1500);
    } catch (err) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      const res = await fetch("/api/strategist/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert("Error starting Stripe onboarding: " + err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header */}
      <div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="border-primary/20 bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl border text-primary shadow-sm">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Earnings & Payouts
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Available balance, Stripe Connect withdrawals, and verified
              invoice earnings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-9 w-9 p-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`}
            />
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-semibold"
          >
            <a href="/api/invoices?format=csv" target="_blank" rel="noreferrer">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      {/* Stripe Connect Banner (if not connected) */}
      {!balanceData.stripeOnboarded && (
        <div className="via-card to-card flex flex-col justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 rounded-xl bg-indigo-500/20 p-3 text-indigo-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-bold">
                Set up Stripe Connect Payouts
              </h3>
              <p className="text-muted-foreground mt-0.5 max-w-xl text-xs">
                Link your bank account to enable direct payouts for approved
                milestone deliverables and retainer periods.
              </p>
            </div>
          </div>
          <Button
            onClick={handleStripeConnect}
            className="shrink-0 gap-2 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Connect Stripe Express
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card/60 border-border/60 space-y-2 rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Available to Withdraw
            </span>
            <Badge
              variant="outline"
              className="bg-muted/20 font-mono text-[10px]"
            >
              Min $50
            </Badge>
          </div>
          <div className="font-mono text-3xl font-extrabold text-emerald-400">
            {balanceData.balanceFormatted}
          </div>
          <div className="pt-2">
            <Button
              size="sm"
              disabled={
                balanceData.balanceCents < 5000 || !balanceData.stripeOnboarded
              }
              onClick={() => setShowWithdrawModal(true)}
              className="w-full gap-2 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <Send className="h-3.5 w-3.5" />
              Withdraw Earnings
            </Button>
          </div>
        </div>

        <div className="bg-card/60 border-border/60 space-y-2 rounded-xl border p-5">
          <span className="text-muted-foreground text-xs font-medium">
            Total Paid Out
          </span>
          <div className="text-foreground font-mono text-3xl font-extrabold">
            $
            {balanceData.payouts
              .filter((p) => p.status === "PAID")
              .reduce((sum, p) => sum + p.amount, 0)
              .toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-muted-foreground pt-1 text-[11px]">
            {balanceData.payouts.length} successful withdrawal transfers
          </p>
        </div>

        <div className="bg-card/60 border-border/60 space-y-2 rounded-xl border p-5">
          <span className="text-muted-foreground text-xs font-medium">
            Stripe Connect Status
          </span>
          <div className="flex items-center gap-2 pt-1">
            {balanceData.stripeOnboarded ? (
              <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 py-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active & Verified
              </Badge>
            ) : (
              <Badge className="gap-1.5 border-amber-500/30 bg-amber-500/10 py-1 text-xs text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                Pending Onboarding
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground font-mono text-[11px]">
            {balanceData.stripeAccountId || "No connected account"}
          </p>
        </div>
      </div>

      {/* Payouts History Section */}
      <div className="space-y-4">
        <h3 className="text-foreground text-base font-bold">
          Withdrawal History
        </h3>
        {balanceData.payouts.length === 0 ? (
          <div className="border-border/80 bg-card/20 text-muted-foreground rounded-xl border border-dashed p-8 text-center text-xs">
            No withdrawal transfers processed yet.
          </div>
        ) : (
          <div className="bg-card/60 border-border/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-border/60 bg-muted/40 text-muted-foreground border-b font-mono text-[11px] uppercase">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Transfer Ref</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-border/40 divide-y">
                  {balanceData.payouts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-muted-foreground px-4 py-3 font-mono">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-foreground px-4 py-3 font-mono text-xs">
                        {p.stripeTransferId || p.id}
                      </td>
                      <td className="text-foreground px-4 py-3 text-right font-mono font-bold">
                        $
                        {p.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={`text-[10px] ${
                            p.status === "PAID"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invoices List Section */}
      <div className="space-y-4">
        <h3 className="text-foreground text-base font-bold">
          Engagement Invoices
        </h3>
        {invoices.length === 0 ? (
          <div className="border-border/80 bg-card/20 text-muted-foreground rounded-xl border border-dashed p-8 text-center text-xs">
            No invoices generated yet.
          </div>
        ) : (
          <div className="bg-card/60 border-border/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-border/60 bg-muted/40 text-muted-foreground border-b font-mono text-[11px] uppercase">
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Engagement</th>
                    <th className="px-4 py-3 font-mono">Date</th>
                    <th className="px-4 py-3 text-right">Gross Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-border/40 divide-y">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 font-mono font-semibold">
                        {inv.number}
                      </td>
                      <td className="text-foreground px-4 py-3 font-medium">
                        {inv.organization?.name || "Client"}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {inv.engagement?.title || "—"}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 font-mono">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-foreground px-4 py-3 text-right font-mono font-bold">
                        $
                        {inv.subtotal?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            inv.status === "PAID"
                              ? "border-emerald-500/30 text-emerald-400"
                              : "border-amber-500/30 text-amber-400"
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="text-muted-foreground hover:text-foreground h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="bg-background/80 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
                <Send className="h-4 w-4 text-emerald-400" />
                Withdraw Available Earnings
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {withdrawError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="bg-muted/40 space-y-1 rounded-xl p-3 text-xs">
                <span className="text-muted-foreground">
                  Available balance:
                </span>
                <div className="text-foreground font-mono text-lg font-bold">
                  {balanceData.balanceFormatted}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Withdrawal Amount ($ USD)
                </label>
                <Input
                  type="number"
                  min="50"
                  step="10"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  required
                />
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Minimum withdrawal is $50.00. Funds arrive via Stripe Connect
                  Express.
                </p>
              </div>

              <div className="border-border/60 flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={withdrawLoading}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  {withdrawLoading ? "Transferring..." : "Confirm Transfer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
