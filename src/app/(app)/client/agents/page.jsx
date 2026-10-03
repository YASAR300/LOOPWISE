"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Bot, Sparkles, Filter } from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { AgentCard } from "@/components/ui/agent-card";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toast";

const INITIAL_AGENTS = [
  {
    id: "agent-1",
    name: "User insights agent",
    description:
      "After each research session, this agent automatically summarizes the conversation and tags key themes like pain points, goals, and feature requests. It pushes clean takeaways to Slack.",
    tools: ["slack", "langgraph", "claude"],
    status: "active",
    lastRun: "Today at 10am",
    href: "/client/agents/agent-1",
  },
  {
    id: "agent-2",
    name: "Feedback synthesizer",
    description:
      "Every Friday, pulls latest feedback from Google Sheets and customer surveys. Groups rows by theme and sentiment, highlighting the most common issues and feature requests.",
    tools: ["n8n", "postgres", "slack"],
    status: "active",
    lastRun: "Yesterday at 1:30pm",
    href: "/client/agents/agent-2",
  },
  {
    id: "agent-3",
    name: "Support feedback clusterer",
    description:
      "Collects user feedback from support tickets and cluster insights by topic and urgency, then delivers a weekly digest of what customers are saying directly to the Product VP.",
    tools: ["zapier", "hubspot", "slack"],
    status: "active",
    lastRun: "Monday at 9am",
    href: "/client/agents/agent-3",
  },
];

const INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    name: "User insights agent",
    description:
      "Identified 3 meetings with external attendees today. Sent transcript analysis to #uxr-insights.",
    date: "Today at 8am",
    tools: ["slack", "claude", "langgraph"],
    status: "needs-action",
  },
  {
    id: "act-2",
    name: "Feedback synthesizer",
    description:
      "Scraped 8 company feedback channels and extracted sentiment vectors for Q3 Roadmap review.",
    date: "Monday at 8am",
    tools: ["postgres", "n8n", "slack"],
    status: "complete",
  },
  {
    id: "act-3",
    name: "User insights agent",
    description:
      "Outreach transcript to Alex from GrowthSync processed without PII leaks.",
    date: "Friday at 8am",
    tools: ["slack", "claude"],
    status: "needs-action",
  },
  {
    id: "act-4",
    name: "User insights agent",
    description:
      "Contacted 5 prospects from your research pipeline with tailored followup questionnaires.",
    date: "Thursday at 8am",
    tools: ["hubspot", "slack"],
    status: "complete",
  },
  {
    id: "act-5",
    name: "Support feedback clusterer",
    description:
      "No new critical leads or Sev-1 tickets matched your urgent filters today.",
    date: "March 28 at 8am",
    tools: ["hubspot", "zapier"],
    status: "complete",
  },
  {
    id: "act-6",
    name: "Feedback synthesizer",
    description:
      "Meeting with 'Product Demo' included 3 external partners. Summary published to Notion.",
    date: "Wednesday at 8am",
    tools: ["n8n", "slack"],
    status: "complete",
  },
  {
    id: "act-7",
    name: "User insights agent",
    description:
      "All meetings today were internal. Agent run completed without generating notifications.",
    date: "April 1 at 8am",
    tools: ["slack", "langgraph"],
    status: "needs-action",
  },
];

export default function ClientAgentsPage() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState(null);
  const [density, setDensity] = useState("comfortable");

  // Saved Views
  const [activeView, setActiveView] = useState("all");

  const handleToggleAgent = async (id, nextState) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: nextState ? "active" : "paused" } : a
      )
    );
    try {
      await fetch(`/api/agents/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: !nextState }),
      });
    } catch (e) {
      // optimistic state already handled with undo toast
    }
  };

  const handleToolClick = (toolName) => {
    const normalized = toolName.toLowerCase();
    if (toolFilter === normalized) {
      setToolFilter(null);
      toast.info(`Cleared filter: ${toolName}`);
    } else {
      setToolFilter(normalized);
      toast.info(`Filtering activity by tool: ${toolName}`);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = act.name.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // Status filter
      if (statusFilter !== "all" && act.status !== statusFilter) {
        return false;
      }

      // Agent filter
      if (agentFilter !== "all" && act.name !== agentFilter) {
        return false;
      }

      // Tool filter
      if (toolFilter) {
        const actTools = (act.tools || []).map((t) => t.toLowerCase());
        if (!actTools.includes(toolFilter)) return false;
      }

      // Saved view filter
      if (activeView === "needs-action" && act.status !== "needs-action")
        return false;
      if (activeView === "complete" && act.status !== "complete") return false;

      return true;
    });
  }, [activities, search, statusFilter, agentFilter, toolFilter, activeView]);

  const needsActionItems = useMemo(
    () => filteredActivities.filter((a) => a.status === "needs-action"),
    [filteredActivities]
  );

  const allOtherItems = useMemo(
    () => filteredActivities.filter((a) => a.status !== "needs-action"),
    [filteredActivities]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* 1. Header / Pod Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ink-3">
            Workspace Pod
          </div>
          <div className="flex items-center gap-2.5">
            <IdentityTile name="UXR Automation" id="uxr-pod" size="md" />
            <h1 className="font-sans text-xl font-bold tracking-tight text-ink">
              UXR Automation Fleet
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/client/agents/new"
            className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add agent</span>
          </Link>
        </div>
      </div>

      {/* 2. Agent Cards Grid (Reference 2) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">
          Agents ({agents.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleStatus={handleToggleAgent}
              onToolClick={handleToolClick}
            />
          ))}
        </div>
      </div>

      {/* 3. Pod Activity Section with FilterRow & Grouped Tables (Reference 2 & 4) */}
      <div className="space-y-6 border-t border-line pt-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-tight text-ink">
            Pod Activity
          </h2>

          <FilterRow
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { value: "all", label: "Any status" },
              { value: "needs-action", label: "Needs action" },
              { value: "complete", label: "Complete" },
              { value: "in-progress", label: "In progress" },
            ]}
            filter2={agentFilter}
            onFilter2Change={setAgentFilter}
            filter2Label="All agents"
            filter2Options={[
              { value: "all", label: "All agents" },
              { value: "User insights agent", label: "User insights agent" },
              { value: "Feedback synthesizer", label: "Feedback synthesizer" },
              {
                value: "Support feedback clusterer",
                label: "Support feedback clusterer",
              },
            ]}
            savedViews={[
              { id: "all", label: "All activity", count: activities.length },
              { id: "needs-action", label: "Needs action", count: 3 },
              { id: "complete", label: "Complete", count: 4 },
            ]}
            activeView={activeView}
            onViewChange={setActiveView}
            density={density}
            onDensityChange={setDensity}
            placeholder="Search activity runs or payloads..."
          />
        </div>

        {/* Active Tool Filter Chip Notice */}
        {toolFilter && (
          <div className="flex w-max items-center gap-2 rounded-lg border border-brand-indigo/20 bg-brand-indigo/10 px-3 py-1.5 text-xs text-brand-indigo">
            <span>
              Filtered by tool: <strong>{toolFilter}</strong>
            </span>
            <button
              type="button"
              onClick={() => setToolFilter(null)}
              className="ml-1 font-bold text-brand-indigo hover:text-ink"
            >
              ×
            </button>
          </div>
        )}

        {/* Grouped Section: Needs action */}
        {needsActionItems.length > 0 && activeView !== "complete" && (
          <GroupedSection title="Needs action" count={needsActionItems.length}>
            <DataTable
              data={needsActionItems}
              density={density}
              onToolClick={handleToolClick}
            />
          </GroupedSection>
        )}

        {/* Grouped Section: All activity */}
        <GroupedSection
          title={
            needsActionItems.length > 0 && activeView === "all"
              ? "All activity"
              : "Activity logs"
          }
          count={allOtherItems.length}
        >
          <DataTable
            data={allOtherItems}
            density={density}
            onToolClick={handleToolClick}
          />
        </GroupedSection>
      </div>
    </div>
  );
}
