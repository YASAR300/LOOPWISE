// src/app/(app)/client/billing/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  FileText,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Building,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function ClientBillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ openTotal: 0, paidTotal: 0 });
  const [payLoading, setPayLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
      setSummary(data.summary || { openTotal: 0, paidTotal: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      setPayLoading(true);
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RETAINER",
          invoiceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment initiation failed");

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      alert("Error initiating payment: " + err.message);
      setPayLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
            Paid
          </Badge>
        );
      case "OPEN":
        return (
          <Badge className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-400">
            Payment Due
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="border-rose-500/30 bg-rose-500/10 text-xs text-rose-400">
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header */}
      <div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="border-primary/20 bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl border text-primary shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Billing & Invoices
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Review monthly retainers, approved hourly timesheets, and
              downloadable PDF receipts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoices}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card/60 border-border/60 space-y-1 rounded-xl border p-4">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <CreditCard className="h-3.5 w-3.5 text-amber-400" />
            Outstanding Due
          </span>
          <div className="text-foreground font-mono text-2xl font-bold">
            $
            {summary.openTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-muted-foreground text-[11px]">
            Open invoices awaiting payment
          </p>
        </div>

        <div className="bg-card/60 border-border/60 space-y-1 rounded-xl border p-4">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Total Settled
          </span>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            $
            {summary.paidTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-muted-foreground text-[11px]">
            Historical payments processed
          </p>
        </div>

        <div className="bg-card/60 border-border/60 space-y-1 rounded-xl border p-4">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Payment Protection
          </span>
          <div className="text-foreground flex items-center gap-1.5 pt-1 text-sm font-semibold">
            <span>Stripe Test Verified</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Encrypted double-entry escrow tracking
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card/40 border-border/50 flex flex-col items-center justify-between gap-3 rounded-xl border p-3 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="text-muted-foreground absolute left-3 top-2.5 h-4 w-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or title..."
            className="bg-background/60 h-9 pl-9"
          />
        </form>

        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <Filter className="text-muted-foreground mr-1 h-4 w-4 shrink-0" />
          {[
            { id: "ALL", label: "All Invoices" },
            { id: "OPEN", label: "Due Now" },
            { id: "PAID", label: "Paid" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === st.id
                  ? "text-primary-foreground bg-primary"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono text-xs">
            Loading billing records...
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="border-border/80 bg-card/20 space-y-3 rounded-2xl border border-dashed p-12 text-center">
          <FileText className="text-muted-foreground/40 mx-auto h-10 w-10" />
          <h3 className="text-foreground text-sm font-semibold">
            No invoices found
          </h3>
          <p className="text-muted-foreground mx-auto max-w-sm text-xs">
            Invoices are automatically generated on monthly retainer cycles or
            upon approved weekly timesheets.
          </p>
        </div>
      ) : (
        <div className="bg-card/60 border-border/60 overflow-hidden rounded-2xl border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-border/60 bg-muted/40 text-muted-foreground border-b font-mono text-[11px] uppercase">
                  <th className="px-4 py-3.5 font-semibold">Invoice Number</th>
                  <th className="px-4 py-3.5 font-semibold">Type</th>
                  <th className="px-4 py-3.5 font-semibold">Engagement</th>
                  <th className="px-4 py-3.5 font-semibold">Issue Date</th>
                  <th className="px-4 py-3.5 font-semibold">Due Date</th>
                  <th className="px-4 py-3.5 text-right font-semibold">
                    Total
                  </th>
                  <th className="px-4 py-3.5 text-center font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border/40 divide-y">
                {invoices.map((inv) => {
                  const isOpen = inv.status === "OPEN";
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3.5 font-mono font-semibold">
                        {inv.number}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className="bg-muted/20 font-mono text-[10px] uppercase"
                        >
                          {inv.invoiceType || "RETAINER"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-foreground line-clamp-1 max-w-[200px] font-medium"
                          title={inv.engagement?.title}
                        >
                          {inv.engagement?.title || "Fractional Retainer"}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-4 py-3.5 font-mono">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-muted-foreground px-4 py-3.5 font-mono">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="text-foreground px-4 py-3.5 text-right font-mono font-bold">
                        $
                        {inv.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOpen && (
                            <Button
                              size="sm"
                              disabled={payLoading}
                              onClick={() => handlePayInvoice(inv.id)}
                              className="text-primary-foreground h-8 bg-primary px-2.5 text-xs font-semibold"
                            >
                              Pay Now
                            </Button>
                          )}
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Download PDF"
                          >
                            <a
                              href={`/api/invoices/${inv.id}/pdf`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="text-muted-foreground hover:text-foreground h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
