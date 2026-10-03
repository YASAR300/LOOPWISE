"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";

const INITIAL_PROPOSALS = [
  {
    id: "prop-1",
    name: "Elena Rostova (Apex Logistics Proposal)",
    description:
      "Proposed 15h/wk @ $175/hr. Includes LangGraph multi-agent architecture and Slack bot handoff.",
    date: "Submitted yesterday",
    tools: ["LangGraph", "Python", "Slack"],
    status: "needs-action",
  },
  {
    id: "prop-2",
    name: "Marcus Chen (Fintech OCR Pipeline)",
    description:
      "Proposed 20h/wk @ $200/hr. Full compliance architecture with Docker containerization.",
    date: "Submitted 3 days ago",
    tools: ["Postgres", "Docker", "Python"],
    status: "in-progress",
  },
  {
    id: "prop-3",
    name: "Sarah Jenkins (HubSpot CRM Automation)",
    description: "Accepted proposal. Milestone 1 underway.",
    date: "Accepted last week",
    tools: ["HubSpot", "Make", "Claude"],
    status: "complete",
  },
];

export default function ClientProposalsPage() {
  const [proposals] = useState(INITIAL_PROPOSALS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");

  const filtered = useMemo(() => {
    return proposals.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.description.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [proposals, search, statusFilter]);

  const needsAction = filtered.filter((p) => p.status === "needs-action");
  const others = filtered.filter((p) => p.status !== "needs-action");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Proposals
            </h1>
            <p className="text-xs text-ink-3">
              Strategist applications and milestone delivery statements
            </p>
          </div>
        </div>
      </div>

      <FilterRow
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "all", label: "Any status" },
          { value: "needs-action", label: "Needs action" },
          { value: "in-progress", label: "In review" },
          { value: "complete", label: "Accepted" },
        ]}
        density={density}
        onDensityChange={setDensity}
        placeholder="Filter proposals by strategist name or skills..."
      />

      {needsAction.length > 0 && (
        <GroupedSection
          title="Awaiting Client Review"
          count={needsAction.length}
        >
          <DataTable data={needsAction} density={density} />
        </GroupedSection>
      )}

      <GroupedSection title="All Proposals" count={others.length}>
        <DataTable data={others} density={density} />
      </GroupedSection>
    </div>
  );
}
