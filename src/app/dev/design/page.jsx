"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  Sparkles,
  Zap,
  Play,
  Pause,
  Layers,
  Bot,
  ExternalLink,
  Keyboard,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { ToolChip, ToolChipRow } from "@/components/ui/tool-chip";
import { StatusPill } from "@/components/ui/status-pill";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { KebabMenu } from "@/components/ui/kebab-menu";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PeekPanel } from "@/components/ui/peek-panel";
import { GroupedSection } from "@/components/ui/grouped-section";
import { FilterRow } from "@/components/ui/filter-row";
import { DataTable } from "@/components/ui/data-table";
import { AgentCard } from "@/components/ui/agent-card";
import { PromptBox } from "@/components/home/prompt-box";
import {
  QuickStartCard,
  QuickStartRow,
} from "@/components/home/quick-start-card";
import { DraftsCarousel } from "@/components/home/draft-card";
import { AttentionList } from "@/components/home/attention-list";
import { RecentlyUpdatedPanel } from "@/components/home/recently-updated-panel";
import { WarmTelemetryChart } from "@/components/ui/warm-telemetry-chart";
import { PlanUsageMeter } from "@/components/layout/plan-usage-meter";
import { ShortcutSheet } from "@/components/ui/shortcut-sheet";
import { FloatingHelpButton } from "@/components/ui/floating-help-button";
import { toast } from "@/components/ui/toast";

export default function DesignSystemShowcasePage() {
  const [isDark, setIsDark] = useState(false);
  const [density, setDensity] = useState("comfortable");
  const [toggleState, setToggleState] = useState(true);
  const [peekOpen, setPeekOpen] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeView, setActiveView] = useState("all");

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const sampleAgent = {
    id: "agent-demo-1",
    name: "User insights agent",
    description:
      "After each research session, this agent automatically summarizes the conversation and tags key themes like pain points, goals, and feature requests. It pushes clean takeaways to Slack.",
    tools: ["slack", "langgraph", "claude"],
    status: "active",
    lastRun: "Today at 10am",
    href: "#",
  };

  const sampleRows = [
    {
      id: "row-1",
      name: "User insights agent",
      description:
        "Identified 3 meetings with external attendees today. Sent transcript analysis to #uxr-insights.",
      date: "Today at 8am",
      tools: ["slack", "claude", "langgraph"],
      status: "needs-action",
    },
    {
      id: "row-2",
      name: "Feedback synthesizer",
      description:
        "Scraped 8 company feedback channels and extracted sentiment vectors for Q3 Roadmap review.",
      date: "Monday at 8am",
      tools: ["postgres", "n8n", "slack"],
      status: "complete",
    },
    {
      id: "row-3",
      name: "Support feedback clusterer",
      description:
        "No new critical leads or Sev-1 tickets matched your urgent filters today.",
      date: "March 28 at 8am",
      tools: ["hubspot", "zapier"],
      status: "in-progress",
    },
    {
      id: "row-4",
      name: "Lead enrichment agent",
      description:
        "Pulled 12 leads from your newsletter signup form and enriched with Apollo telemetry.",
      date: "March 26 at 8am",
      tools: ["hubspot", "make"],
      status: "draft",
    },
  ];

  return (
    <div className="bg-app min-h-screen select-none p-6 text-ink transition-colors duration-200 md:p-10">
      {/* Top Floating Controls Bar */}
      <div className="mx-auto mb-10 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-brand-accent-soft px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider text-brand-accent">
              Design System Showcase
            </span>
            <span className="text-xs text-ink-3">/dev/design</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Warm Automation Platform Component Library
          </h1>
          <p className="text-xs text-ink-3">
            Reference 2, 3, and 4 tokens, widgets, status system, density, and
            keyboard controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-secondary-outline flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-semibold"
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-brand-indigo" />
            )}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* Density Toggle */}
          <button
            type="button"
            onClick={() =>
              setDensity(density === "comfortable" ? "compact" : "comfortable")
            }
            className="btn-secondary-outline flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-semibold"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="capitalize">{density} Density</span>
          </button>

          {/* Shortcut Sheet Modal Trigger */}
          <button
            type="button"
            onClick={() => setShortcutOpen(true)}
            className="btn-primary-indigo shadow-xs flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-semibold"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Shortcuts (?)</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12">
        {/* SECTION 1: DESIGN TOKENS & IDENTITY TILES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              1. Design Tokens & Deterministic Identity Tiles
            </h2>
            <span className="text-xs text-ink-3">
              Violet, Mint, Coral, Sun, Pink, Teal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {[
              "UXR Pod",
              "Product Management",
              "Sales Outreach",
              "Telemetry Bot",
              "Growth Sync",
              "Finance Gateway",
            ].map((name, idx) => (
              <div
                key={idx}
                className="shadow-2xs flex items-center gap-3 rounded-xl border border-line bg-panel p-3"
              >
                <IdentityTile name={name} id={`id-${idx}`} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">
                    {name}
                  </p>
                  <p className="font-mono text-[10px] text-ink-3">id-{idx}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: STATUS SYSTEM (Icon + Text, AA Contrast) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              2. Status System (Icon + Text Always, 1px Border, 6px Radius)
            </h2>
            <span className="text-xs text-ink-3">
              Defined in src/lib/status.js
            </span>
          </div>

          <div className="shadow-2xs flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel p-4">
            <StatusPill status="needs-action" />
            <StatusPill status="in-progress" />
            <StatusPill status="complete" />
            <StatusPill status="draft" />
            <StatusPill status="not-published" />
            <StatusPill status="paused" />
            <StatusPill status="failed" />
          </div>
        </section>

        {/* SECTION 3: TOOL CHIPS & INTEGRATION BADGES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              3. Filterable Tool Chips (Glyphs + Brand Tints)
            </h2>
            <span className="text-xs text-ink-3">
              Clicking filters the active table
            </span>
          </div>

          <div className="shadow-2xs flex flex-wrap gap-2 rounded-2xl border border-line bg-panel p-4">
            {[
              "n8n",
              "Make",
              "Zapier",
              "LangGraph",
              "Claude",
              "OpenAI",
              "HubSpot",
              "Salesforce",
              "Slack",
              "PostgreSQL",
              "Python",
              "Docker",
            ].map((tool) => (
              <ToolChip
                key={tool}
                tool={tool}
                onClick={(name) => toast.info(`Filtered by tool: ${name}`)}
              />
            ))}
          </div>
        </section>

        {/* SECTION 4: PROMPT BOX (Reference 3) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              4. Prompt Box with Thin Orange-to-Pink Gradient Border
            </h2>
            <span className="text-xs text-ink-3">
              Submits prompt to Workflow Mapper / New Brief
            </span>
          </div>

          <div className="shadow-2xs rounded-2xl border border-line bg-panel p-6">
            <PromptBox
              role="CLIENT"
              headline="What would you like to automate?"
              placeholder="Example: When customer submits a contract, parse PDF line items, verify Tax ID, and notify Slack."
              onSubmit={(text) =>
                toast.success(`Workflow prompt submitted: "${text}"`)
              }
            />
          </div>
        </section>

        {/* SECTION 5: START FROM SCRATCH CARDS */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              5. Start From Scratch Quick Cards (5 in a row, Orange-tinted
              tiles)
            </h2>
          </div>

          <QuickStartRow role="CLIENT" />
        </section>

        {/* SECTION 6: TWO-UP PANELS (Attention List & Drafts Carousel) */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              6. Two-Up Panels (Attention List + Horizontal Drafts Carousel)
            </h2>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
            <div className="flex flex-col lg:col-span-4">
              <AttentionList
                title="Up next"
                seeMoreHref="#"
                items={[
                  {
                    id: "demo-a1",
                    title: "LangGraph state machine ready for approval",
                    meta: "Review milestone deliverable",
                    href: "#",
                    urgent: true,
                  },
                  {
                    id: "demo-a2",
                    title: "Notice: SMTP port 25 retirement approaching",
                    meta: "Security advisory notice",
                    href: "#",
                    urgent: false,
                  },
                ]}
              />
            </div>

            <div className="flex flex-col lg:col-span-8">
              <DraftsCarousel
                title="Unfinished Drafts"
                drafts={[
                  {
                    id: "d-1",
                    title: "SAP Invoice Triage & Line Extraction",
                    status: "not-published",
                    editedAt: "Edited 24m ago",
                    tools: ["n8n", "OpenAI", "Slack"],
                    href: "#",
                  },
                  {
                    id: "d-2",
                    title: "HubSpot High-Value Lead Enrichment",
                    status: "not-published",
                    editedAt: "Edited 3h ago",
                    tools: ["HubSpot", "Claude", "Make"],
                    href: "#",
                  },
                  {
                    id: "d-3",
                    title: "SOC 2 Audit Telemetry Extractor",
                    status: "draft",
                    editedAt: "Edited 1d ago",
                    tools: ["Postgres", "LangGraph"],
                    href: "#",
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* SECTION 7: RECENTLY UPDATED LIST PANEL */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              7. Recently Updated List Panel (Orange bolt + On/Off state pill)
            </h2>
          </div>

          <RecentlyUpdatedPanel />
        </section>

        {/* SECTION 8: AGENT CARD GRID (Reference 2) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              8. Agent Cards (ToggleSwitch with Undo Toast, KebabMenu,
              ToolChips, Last run)
            </h2>
            <span className="text-xs text-ink-3">Optimistic toggle update</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AgentCard
              agent={sampleAgent}
              onToggleStatus={(id, state) => {
                toast.info(`Agent ${id} state: ${state ? "Active" : "Paused"}`);
              }}
            />
            <AgentCard
              agent={{
                ...sampleAgent,
                id: "agent-demo-2",
                name: "Feedback synthesizer",
                description:
                  "Every Friday, pulls latest feedback from Google Sheets and customer surveys. Groups rows by theme and sentiment.",
                tools: ["n8n", "postgres", "slack"],
                lastRun: "Yesterday at 1:30pm",
              }}
            />
            <AgentCard
              agent={{
                ...sampleAgent,
                id: "agent-demo-3",
                name: "Support feedback clusterer",
                description:
                  "Collects user feedback from support tickets and cluster insights by topic and urgency, then delivers a weekly digest.",
                tools: ["zapier", "hubspot", "slack"],
                lastRun: "Monday at 9am",
              }}
            />
          </div>
        </section>

        {/* SECTION 9: DATA TABLE & GROUPED SECTIONS (Keyboard J/K, Enter, X, Peek) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              9. Grouped Data Table with Tinted Header (48px / 40px, J/K Nav,
              Peek Drawer)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-3">
                Try pressing J / K / X / Space
              </span>
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
              { value: "complete", label: "Complete" },
              { value: "in-progress", label: "In progress" },
            ]}
            savedViews={[
              { id: "all", label: "All records", count: sampleRows.length },
              { id: "needs-action", label: "Needs action", count: 1 },
            ]}
            activeView={activeView}
            onViewChange={setActiveView}
            density={density}
            onDensityChange={setDensity}
          />

          <GroupedSection title="All Activity" count={sampleRows.length}>
            <DataTable data={sampleRows} density={density} />
          </GroupedSection>
        </section>

        {/* SECTION 10: WARM TELEMETRY CHARTS (NO GRIDLINES) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              10. Warm Telemetry Chart (Strictly Zero Gridlines, 2px Stroke, 10%
              Soft Fill)
            </h2>
            <span className="text-xs text-ink-3">
              Hover points for popover tooltip
            </span>
          </div>

          <div className="shadow-2xs space-y-4 rounded-2xl border border-line bg-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Autonomous Executions / Hour
                </h3>
                <p className="text-xs text-ink-3">
                  24-hour rolling event velocity
                </p>
              </div>
              <span className="rounded border border-line bg-panel-2 px-2 py-0.5 font-mono text-xs text-ink-2">
                2,715 runs total
              </span>
            </div>

            <WarmTelemetryChart
              metricKey="runs"
              metricLabel="runs"
              strokeColor="#4B3FD6"
              height={180}
            />
          </div>
        </section>

        {/* SECTION 11: PLAN USAGE METER */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              11. Plan & Usage Meter (Circular SVG Progress Ring)
            </h2>
          </div>

          <div className="shadow-2xs max-w-xs rounded-xl border border-line bg-panel p-3">
            <PlanUsageMeter
              planName="Advanced plan"
              metricName="Activities"
              used={320}
              limit={10000}
            />
          </div>
        </section>

        {/* SECTION 12: AUTH & ONBOARDING COMPONENTS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              12. Authentication & Onboarding Component System
            </h2>
            <span className="text-xs text-ink-3">src/components/auth</span>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {/* Form Alerts */}
            <div className="shadow-2xs space-y-3 rounded-2xl border border-line bg-panel p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Form Alerts (Accessible, Escape dismissible)
              </h3>
              <div className="space-y-2">
                <FormAlert
                  type="error"
                  message="Invalid credentials. Verify your work email and password."
                />
                <FormAlert
                  type="warning"
                  message="Email unverified"
                  description="Check your inbox or click resend."
                  action={
                    <button
                      type="button"
                      onClick={() => toast.info("Verification email resent")}
                      className="btn-secondary-outline mt-1 rounded-lg px-2.5 py-1 text-xs font-semibold"
                    >
                      Resend verification email
                    </button>
                  }
                />
                <FormAlert
                  type="success"
                  message="Password updated successfully."
                />
              </div>
            </div>

            {/* Email Pill & Product Peek */}
            <div className="space-y-4">
              <div className="shadow-2xs space-y-3 rounded-2xl border border-line bg-panel p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Email Pill & Verification Display
                </h3>
                <EmailPill
                  email="alex.carter@enterprise.ai"
                  onEdit={() => toast.info("Edit email clicked")}
                />
              </div>

              <div className="max-w-md">
                <ProductPeek
                  stats={{
                    approvedStrategists: 14,
                    hoursAutomated: 32730,
                    satisfactionPct: 99.4,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Shortcut Sheet Modal */}
      <ShortcutSheet
        isOpen={shortcutOpen}
        onClose={() => setShortcutOpen(false)}
      />

      {/* Floating Support Help Bubble */}
      <FloatingHelpButton />
    </div>
  );
}
