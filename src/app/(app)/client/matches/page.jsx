"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Sparkles, ArrowRight } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";

const INITIAL_MATCHES = [
  {
    id: "match-1",
    name: "Elena Rostova",
    description:
      "Fractional Head of AI • Ex-Stripe • 98% Match for Accounts Payable Triage (LangGraph, n8n)",
    date: "Matched 2 days ago",
    tools: ["LangGraph", "Python", "Slack"],
    status: "complete",
    href: "/strategists/elena-rostova",
  },
  {
    id: "match-2",
    name: "Dr. Marcus Chen",
    description:
      "AI Solutions Architect • Ex-Meta • 94% Match for Enterprise B2B Lead Enrichment",
    date: "Matched 4 days ago",
    tools: ["Postgres", "Docker", "Python"],
    status: "in-progress",
    href: "/strategists/marcus-chen",
  },
  {
    id: "match-3",
    name: "Sarah Jenkins",
    description:
      "RevOps Automation Architect • 91% Match for CRM Escalation Bot",
    date: "Matched 1 week ago",
    tools: ["HubSpot", "Make", "Claude"],
    status: "complete",
    href: "/strategists/sarah-jenkins",
  },
];

export default function ClientMatchesPage() {
  const [matches] = useState(INITIAL_MATCHES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");

  const filtered = useMemo(() => {
    return matches.filter((item) => {
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
  }, [matches, search, statusFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              AI Strategist Matches
            </h1>
            <p className="text-xs text-ink-3">
              AI-recommended vetted talent matched to your active workflow
              briefs
            </p>
          </div>
        </div>

        <Link
          href="/strategists"
          className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <span>Explore Directory</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <FilterRow
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        density={density}
        onDensityChange={setDensity}
        placeholder="Filter matched talent..."
      />

      <GroupedSection title="Recommended Strategists" count={filtered.length}>
        <DataTable data={filtered} density={density} />
      </GroupedSection>
    </div>
  );
}
