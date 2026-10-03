"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Plus, ShieldCheck } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";

const INITIAL_USERS = [
  {
    id: "user-1",
    name: "Elena Rostova",
    description:
      "Strategist • elena@rostova.ai • 99.4% rating • 2 active contracts",
    date: "Joined Jan 2026",
    tools: ["LangGraph", "Python", "Slack"],
    status: "complete",
  },
  {
    id: "user-2",
    name: "Keith Rodman",
    description:
      "Client (Apex Logistics) • keith@apexlogistics.com • Enterprise Tier",
    date: "Joined Feb 2026",
    tools: ["Slack", "HubSpot"],
    status: "complete",
  },
  {
    id: "user-3",
    name: "Marcus Chen",
    description: "Strategist • marcus@chenai.io • Vetting portfolio in review",
    date: "Joined 2 days ago",
    tools: ["Docker", "Postgres", "Python"],
    status: "needs-action",
  },
  {
    id: "user-4",
    name: "David Kim",
    description: "Strategist • Suspended for milestone breach",
    date: "Joined Dec 2025",
    tools: ["Zapier"],
    status: "paused",
  },
];

export default function AdminUsersPage() {
  const [users] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.description.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, statusFilter]);

  const needsAction = filtered.filter((u) => u.status === "needs-action");
  const others = filtered.filter((u) => u.status !== "needs-action");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Platform Users
            </h1>
            <p className="text-xs text-ink-3">
              Clients, Vetted AI Strategists, and Org Members
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Invite user</span>
        </button>
      </div>

      <FilterRow
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "all", label: "Any status" },
          { value: "needs-action", label: "Requires review" },
          { value: "complete", label: "Active" },
          { value: "paused", label: "Suspended" },
        ]}
        density={density}
        onDensityChange={setDensity}
        placeholder="Search user name, email, or org..."
      />

      {needsAction.length > 0 && (
        <GroupedSection
          title="Requires Admin Review"
          count={needsAction.length}
        >
          <DataTable data={needsAction} density={density} />
        </GroupedSection>
      )}

      <GroupedSection title="All Users" count={others.length}>
        <DataTable data={others} density={density} />
      </GroupedSection>
    </div>
  );
}
