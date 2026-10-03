"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";

const INITIAL_ENGAGEMENTS = [
  {
    id: "eng-1",
    name: "Apex Logistics AI Orchestration",
    description:
      "Elena Rostova leading 15h/wk fractional automation. Milestone 2 in progress: automated carrier dispatch.",
    date: "Milestone due Oct 15",
    tools: ["LangGraph", "Python", "Slack"],
    status: "in-progress",
    href: "/client/engagements/eng-1",
  },
  {
    id: "eng-2",
    name: "CloudScale Inbound Lead Routing",
    description:
      "Marcus Vance deployed high-intent lead enrichment with instant HubSpot to Slack alerts.",
    date: "Active retainer",
    tools: ["HubSpot", "Make", "Claude"],
    status: "complete",
    href: "/client/engagements/eng-2",
  },
  {
    id: "eng-3",
    name: "Accounts Payable Triage Automation",
    description:
      "Milestone 3 completed. Client sign-off and escrow payment approval needed.",
    date: "Needs approval",
    tools: ["n8n", "OpenAI", "Postgres"],
    status: "needs-action",
    href: "/client/engagements/eng-3",
  },
];

export default function ClientEngagementsPage() {
  const [engagements, setEngagements] = useState(INITIAL_ENGAGEMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");
  const [activeView, setActiveView] = useState("all");

  const filtered = useMemo(() => {
    return engagements.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (activeView === "needs-action" && item.status !== "needs-action")
        return false;
      return true;
    });
  }, [engagements, search, statusFilter, activeView]);

  const needsAction = filtered.filter((e) => e.status === "needs-action");
  const allOther = filtered.filter((e) => e.status !== "needs-action");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Active Engagements
            </h1>
            <p className="text-xs text-ink-3">
              Contracts, escrow milestones, and assigned Fractional Heads of AI
            </p>
          </div>
        </div>

        <Link
          href="/client/briefs/new"
          className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>New engagement</span>
        </Link>
      </div>

      {/* Filter Row */}
      <FilterRow
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "all", label: "Any status" },
          { value: "needs-action", label: "Needs action" },
          { value: "in-progress", label: "In progress" },
          { value: "complete", label: "Complete" },
        ]}
        savedViews={[
          { id: "all", label: "All contracts", count: engagements.length },
          { id: "needs-action", label: "Needs action", count: 1 },
        ]}
        activeView={activeView}
        onViewChange={setActiveView}
        density={density}
        onDensityChange={setDensity}
        placeholder="Filter engagements..."
      />

      {/* Grouped Section: Needs Action */}
      {needsAction.length > 0 && (
        <GroupedSection title="Needs action" count={needsAction.length}>
          <DataTable data={needsAction} density={density} />
        </GroupedSection>
      )}

      {/* Grouped Section: All Activity */}
      <GroupedSection
        title={needsAction.length > 0 ? "All engagements" : "Active contracts"}
        count={allOther.length}
      >
        <DataTable data={allOther} density={density} />
      </GroupedSection>
    </div>
  );
}
