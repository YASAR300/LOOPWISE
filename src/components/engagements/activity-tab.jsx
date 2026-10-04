// src/components/engagements/activity-tab.jsx
"use client";

import { useState } from "react";
import {
  Activity,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function ActivityTab({ engagement, activities = [] }) {
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const getCategory = (type) => {
    if (type.includes("DELIVERABLE")) return "DELIVERABLES";
    if (type.includes("TIME") || type.includes("TIMESHEET")) return "TIME";
    if (type.includes("CADENCE")) return "CADENCE";
    if (
      type.includes("CONTRACT") ||
      type.includes("ENGAGEMENT") ||
      type.includes("SCOPE") ||
      type.includes("REPLACEMENT")
    )
      return "GOVERNANCE";
    if (type.includes("FILE")) return "FILES";
    return "OTHER";
  };

  const filteredActivities = activities.filter((act) => {
    const category = getCategory(act.type);
    const matchesFilter = filterType === "ALL" || category === filterType;
    const matchesSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEventIcon = (type) => {
    if (
      type.includes("CONTRACT_SIGNED") ||
      type.includes("DELIVERABLE_APPROVED") ||
      type.includes("TIMESHEET_APPROVED")
    ) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
    if (
      type.includes("PAUSED") ||
      type.includes("DISPUTED") ||
      type.includes("CHANGES_REQUESTED")
    ) {
      return <AlertCircle className="h-4 w-4 text-amber-400" />;
    }
    if (type.includes("TIME")) {
      return <Clock className="h-4 w-4 text-sky-400" />;
    }
    if (type.includes("DELIVERABLE")) {
      return <Layers className="h-4 w-4 text-indigo-400" />;
    }
    if (type.includes("CADENCE")) {
      return <Calendar className="h-4 w-4 text-purple-400" />;
    }
    if (type.includes("FILE")) {
      return <FileText className="h-4 w-4 text-pink-400" />;
    }
    return <Activity className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border/60 flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
            Immutable Activity Audit Log
            <Badge variant="outline" className="bg-muted/40 font-mono text-xs">
              {activities.length} Events
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Cryptographically tracked audit trail of all contract edits,
            deliverable states, timesheets, and decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 py-1 text-xs text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Append-Only Verified
          </Badge>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-card/40 border-border/50 flex flex-col items-center justify-between gap-3 rounded-xl border p-3 sm:flex-row">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit log events..."
          className="bg-background/60 h-9 max-w-sm"
        />

        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <Filter className="text-muted-foreground mr-1 h-4 w-4 shrink-0" />
          {[
            { id: "ALL", label: "All Events" },
            { id: "DELIVERABLES", label: "Deliverables" },
            { id: "CADENCE", label: "Cadence" },
            { id: "TIME", label: "Time & Billing" },
            { id: "GOVERNANCE", label: "Contracts & State" },
            { id: "FILES", label: "Files" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                filterType === cat.id
                  ? "text-primary-foreground bg-primary"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      {filteredActivities.length === 0 ? (
        <div className="border-border/80 bg-card/20 rounded-xl border border-dashed p-12 text-center">
          <Activity className="text-muted-foreground/40 mx-auto mb-3 h-10 w-10" />
          <h3 className="text-foreground text-sm font-semibold">
            No activity events found
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Events will automatically record as you log hours, move
            deliverables, and post updates.
          </p>
        </div>
      ) : (
        <div className="before:bg-border/60 relative space-y-6 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-[2px]">
          {filteredActivities.map((act) => {
            const date = new Date(act.createdAt);
            const timeStr = date.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });
            const dateStr = date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div key={act.id} className="group relative">
                {/* Timeline node icon */}
                <div className="border-border absolute -left-[30px] top-1.5 rounded-full border-2 bg-background p-1 transition-colors group-hover:border-primary">
                  {getEventIcon(act.type)}
                </div>

                <div className="bg-card/50 hover:bg-card/80 border-border/60 rounded-xl border p-3.5 shadow-sm transition-all">
                  <div className="mb-1.5 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-muted/30 font-mono text-[10px] uppercase"
                      >
                        {act.type.replace(/_/g, " ")}
                      </Badge>
                      <h4 className="text-foreground text-sm font-semibold">
                        {act.title}
                      </h4>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px]">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  {act.actor && (
                    <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                      <UserCheck className="text-muted-foreground/70 h-3 w-3" />
                      <span>
                        Initiated by{" "}
                        <strong className="text-foreground">
                          {act.actor.name || act.actor.email}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* Metadata display if present */}
                  {act.metadata && Object.keys(act.metadata).length > 0 && (
                    <div className="border-border/40 text-muted-foreground bg-muted/20 mt-2.5 rounded border-t p-2 pt-2 font-mono text-[11px]">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(act.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="opacity-70">{key}:</span>{" "}
                            <span className="text-foreground">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
