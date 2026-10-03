"use client";

import React, { useState } from "react";
import { Scale } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";

export default function AdminDisputesPage() {
  const [disputes] = useState([
    {
      id: "disp-1",
      name: "Apex Logistics vs. Elena Rostova",
      description:
        "Milestone 2 deliverable sign-off dispute: carrier integration scope clarification. $4,200 held in escrow.",
      date: "Opened 1 day ago",
      tools: ["LangGraph", "Slack"],
      status: "needs-action",
    },
  ]);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState("comfortable");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Escrow Disputes & Arbitration
            </h1>
            <p className="text-xs text-ink-3">
              Independent mediation for contractual milestone disagreements
            </p>
          </div>
        </div>
      </div>

      <FilterRow
        search={search}
        onSearchChange={setSearch}
        density={density}
        onDensityChange={setDensity}
        placeholder="Filter disputes..."
      />

      <GroupedSection title="Active Arbitration Cases" count={disputes.length}>
        <DataTable data={disputes} density={density} />
      </GroupedSection>
    </div>
  );
}
