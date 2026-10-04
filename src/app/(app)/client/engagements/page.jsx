"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Layers,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function ClientEngagementsPage() {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionCount, setActionCount] = useState(0);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/client/engagements?status=${statusFilter}`);
      if (!res.ok) throw new Error("Failed to fetch engagements");
      const data = await res.json();
      setEngagements(data.engagements || []);
      setActionCount(data.actionCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    return engagements.filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesStrategist = item.strategistProfile?.user?.name
        ?.toLowerCase()
        .includes(q);
      return matchesTitle || matchesStrategist;
    });
  }, [engagements, search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            Active
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
            Paused
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400">
            Completed
          </Badge>
        );
      case "TERMINATED":
        return (
          <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-400">
            Terminated
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header */}
      <div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="border-primary/20 bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl border text-primary shadow-sm">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Client Engagements
              </h1>
              {actionCount > 0 && (
                <Badge className="border-amber-500/40 bg-amber-500/20 text-xs text-amber-300">
                  {actionCount} action needed
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Workspaces, deliverables kanban, cadence updates, and time
              approvals for your fractional leaders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEngagements}
            disabled={loading}
            className="h-9 w-9 p-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`}
            />
          </Button>

          <Button
            asChild
            className="text-primary-foreground gap-2 bg-primary shadow-sm"
          >
            <Link href="/client/briefs/new">
              <Plus className="h-4 w-4" />
              <span>New Brief / Hire</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card/40 border-border/50 flex flex-col items-center justify-between gap-3 rounded-xl border p-3 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="text-muted-foreground absolute left-3 top-2.5 h-4 w-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or strategist..."
            className="bg-background/60 h-9 pl-9"
          />
        </div>

        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <Filter className="text-muted-foreground mr-1 h-4 w-4 shrink-0" />
          {[
            { id: "ALL", label: "All Engagements" },
            { id: "ACTIVE", label: "Active" },
            { id: "PAUSED", label: "Paused" },
            { id: "COMPLETED", label: "Completed" },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status.id
                  ? "text-primary-foreground bg-primary"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Engagements List */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-primary" />
          <p className="text-muted-foreground font-mono text-xs">
            Loading active engagements...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-border/80 bg-card/20 space-y-4 rounded-2xl border border-dashed p-12 text-center">
          <Briefcase className="text-muted-foreground/40 mx-auto h-10 w-10" />
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              No engagements found
            </h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
              {statusFilter !== "ALL"
                ? `No engagements currently in ${statusFilter} state.`
                : "Accept a proposal or create a direct hire contract to launch your first engagement."}
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href="/client/proposals">
              <FileCheck2 className="h-4 w-4" />
              View Received Proposals
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((eng) => {
            const hasAction = eng.itemsNeedingAction > 0;
            return (
              <div
                key={eng.id}
                className={`bg-card/60 hover:bg-card/90 relative rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
                  hasAction
                    ? "border-amber-500/40 ring-1 ring-amber-500/20"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-muted-foreground bg-muted/40 rounded px-2 py-0.5 font-mono text-[11px] uppercase">
                        {eng.model}
                      </span>
                      <h3 className="text-foreground text-base font-bold">
                        {eng.title}
                      </h3>
                      {getStatusBadge(eng.status)}
                    </div>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                      <span>
                        Strategist:{" "}
                        <strong className="text-foreground">
                          {eng.strategistProfile?.user?.name ||
                            "Vetted Strategist"}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Rate:{" "}
                        <strong className="text-foreground">
                          ${eng.rate?.toLocaleString()}{" "}
                          {eng.model === "RETAINER" ? "/mo" : "/hr"}
                        </strong>
                      </span>
                      {eng.model === "HOURLY" && (
                        <>
                          <span>•</span>
                          <span>
                            Logged this week:{" "}
                            <strong className="text-foreground">
                              {eng.hoursThisWeek || 0}h /{" "}
                              {eng.hourlyWeeklyCap || 20}h
                            </strong>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action required tags */}
                    {hasAction && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {eng.needsContractSig && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                            <FileCheck2 className="h-3 w-3" /> Signature Needed
                          </span>
                        )}
                        {eng.pendingDeliverables > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                            <Layers className="h-3 w-3" />{" "}
                            {eng.pendingDeliverables} Deliverable In Review
                          </span>
                        )}
                        {eng.unacknowledgedUpdate && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-300">
                            <Clock className="h-3 w-3" /> Weekly Cadence
                            Awaiting Reaction
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Button
                      asChild
                      className="text-primary-foreground h-9 gap-2 bg-primary px-4 text-xs font-semibold"
                    >
                      <Link href={`/client/engagements/${eng.id}`}>
                        Open Workspace
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
