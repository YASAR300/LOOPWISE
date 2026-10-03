"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toast";

const INITIAL_BRIEFS = [
  {
    id: "brief-101",
    name: "Enterprise Accounts Payable AI Parser",
    description:
      "Automate three-way matching across NetSuite invoices, purchase orders, and bill-of-lading PDF scans.",
    date: "Created 2 days ago",
    tools: ["n8n", "OpenAI", "Postgres"],
    status: "needs-action",
    href: "/client/briefs/brief-101",
  },
  {
    id: "brief-102",
    name: "Inbound B2B Lead Enrichment Engine",
    description:
      "Synthesize incoming demo requests from HubSpot with LinkedIn and Apollo telemetry to score intent.",
    date: "Created 4 days ago",
    tools: ["HubSpot", "Make", "Claude"],
    status: "in-progress",
    href: "/client/briefs/brief-102",
  },
  {
    id: "brief-103",
    name: "Support Escalation & Sentiment Triage",
    description:
      "Autonomous Slack alert system that flags churn-risk Zendesk tickets and generates draft response outlines.",
    date: "Created 1 week ago",
    tools: ["Slack", "Zapier", "LangGraph"],
    status: "complete",
    href: "/client/briefs/brief-103",
  },
  {
    id: "brief-104",
    name: "SOC 2 Audit Telemetry Extractor",
    description:
      "Continuous compliance log collector and S3 archiver with SHA-256 tamper-evident checksums.",
    date: "Created 2 weeks ago",
    tools: ["Docker", "Python", "Postgres"],
    status: "draft",
    href: "/client/briefs/brief-104",
  },
  {
    id: "brief-105",
    name: "Multi-Source Meeting Intelligence Parser",
    description:
      "Extract action items from Zoom / Google Meet transcripts and sync directly to Jira epics.",
    date: "Created 3 weeks ago",
    tools: ["Claude", "LangGraph", "Slack"],
    status: "complete",
    href: "/client/briefs/brief-105",
  },
];

export default function ClientBriefsPage() {
  const [briefs, setBriefs] = useState(INITIAL_BRIEFS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");
  const [activeView, setActiveView] = useState("all");

  const filteredBriefs = useMemo(() => {
    return briefs.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (activeView === "needs-action" && item.status !== "needs-action")
        return false;
      if (activeView === "in-progress" && item.status !== "in-progress")
        return false;
      return true;
    });
  }, [briefs, search, statusFilter, activeView]);

  const needsAction = filteredBriefs.filter((b) => b.status === "needs-action");
  const allOther = filteredBriefs.filter((b) => b.status !== "needs-action");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Workflow Briefs
            </h1>
            <p className="text-xs text-ink-3">
              Define target processes and match with vetted Heads of AI
            </p>
          </div>
        </div>

        <Link
          href="/client/briefs/new"
          className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>New brief</span>
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
          { value: "draft", label: "Draft" },
        ]}
        savedViews={[
          { id: "all", label: "All briefs", count: briefs.length },
          { id: "needs-action", label: "Needs action", count: 1 },
          { id: "in-progress", label: "Active matching", count: 1 },
        ]}
        activeView={activeView}
        onViewChange={setActiveView}
        density={density}
        onDensityChange={setDensity}
        placeholder="Filter briefs by name or scope..."
      />

      {/* Grouped Section: Needs Action */}
      {needsAction.length > 0 && activeView !== "in-progress" && (
        <GroupedSection title="Needs action" count={needsAction.length}>
          <DataTable data={needsAction} density={density} />
        </GroupedSection>
      )}

      {/* Grouped Section: All Activity */}
      <GroupedSection
        title={
          needsAction.length > 0 && activeView === "all"
            ? "All briefs"
            : "Brief list"
        }
        count={allOther.length}
      >
        <DataTable data={allOther} density={density} />
      </GroupedSection>
    </div>
  );
}
