"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";

const INITIAL_VETTING = [
  {
    id: "vet-1",
    name: "Dr. Marcus Chen",
    description:
      "Applicant for Fractional Head of AI • Technical interview passed • Case study review pending",
    date: "Submitted 2h ago",
    tools: ["LangGraph", "Docker", "Python"],
    status: "needs-action",
  },
  {
    id: "vet-2",
    name: "Aisha Patel",
    description:
      "Applicant for RevOps Strategist • Background check in progress",
    date: "Submitted yesterday",
    tools: ["HubSpot", "Salesforce", "Make"],
    status: "in-progress",
  },
  {
    id: "vet-3",
    name: "Elena Rostova",
    description: "Verified Fractional Head of AI • Top 1% approved",
    date: "Approved Jan 15",
    tools: ["LangGraph", "Python", "Slack"],
    status: "complete",
  },
];

export default function AdminVettingPage() {
  const [items] = useState(INITIAL_VETTING);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");

  const filtered = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, search, statusFilter]);

  const pending = filtered.filter((i) => i.status === "needs-action");
  const others = filtered.filter((i) => i.status !== "needs-action");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Strategist Vetting Queue
            </h1>
            <p className="text-xs text-ink-3">
              Admissions review for the top 3% fractional AI leaders
            </p>
          </div>
        </div>
      </div>

      <FilterRow
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        density={density}
        onDensityChange={setDensity}
        placeholder="Filter applicants by name or specialty..."
      />

      {pending.length > 0 && (
        <GroupedSection title="Pending Review" count={pending.length}>
          <DataTable data={pending} density={density} />
        </GroupedSection>
      )}

      <GroupedSection title="Reviewed Candidates" count={others.length}>
        <DataTable data={others} density={density} />
      </GroupedSection>
    </div>
  );
}
