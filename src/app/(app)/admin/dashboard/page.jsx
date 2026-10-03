"use client";

import React from "react";
import { PromptBox } from "@/components/home/prompt-box";
import { QuickStartRow } from "@/components/home/quick-start-card";
import { AttentionList } from "@/components/home/attention-list";
import { DraftsCarousel } from "@/components/home/draft-card";
import { RecentlyUpdatedPanel } from "@/components/home/recently-updated-panel";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* 1. Prompt Box */}
      <section>
        <PromptBox
          role="ADMIN"
          headline="Platform Administration & Trust"
          placeholder="Search user, organization, strategist profile, escrow transaction, or audit log..."
        />
      </section>

      {/* 2. Admin Quick Actions */}
      <section>
        <QuickStartRow role="ADMIN" />
      </section>

      {/* 3. Two-Up Panels */}
      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-4">
          <AttentionList
            title="Needs attention"
            seeMoreHref="/admin/vetting"
            items={[
              {
                id: "adm-1",
                title: "5 strategist applications awaiting background vetting",
                meta: "Identity verified • Technical interview pending",
                href: "/admin/vetting",
                urgent: true,
              },
              {
                id: "adm-2",
                title: "1 escrow milestone dispute opened: Apex Logistics",
                meta: "$4,200 held in escrow • Evidence submitted",
                href: "/admin/disputes",
                urgent: true,
              },
              {
                id: "adm-3",
                title: "Weekly Stripe payout ledger ready for reconciliation",
                meta: "$142,600 processed • Platform rake 15%",
                href: "/admin/payments",
                urgent: false,
              },
            ]}
          />
        </div>

        <div className="flex flex-col lg:col-span-8">
          <DraftsCarousel
            title="Pending Review Items"
            drafts={[
              {
                id: "rev-1",
                title: "Dr. Marcus Chen (LangGraph Specialist Profile)",
                status: "in-progress",
                editedAt: "Submitted 2 hours ago",
                tools: ["LangGraph", "Python", "Docker"],
                href: "/admin/vetting",
              },
              {
                id: "rev-2",
                title: "Enterprise Master Service Agreement - CloudScale Inc.",
                status: "draft",
                editedAt: "Updated yesterday",
                tools: ["Postgres"],
                href: "/admin/settings",
              },
              {
                id: "rev-3",
                title: "Global Rate Limit Ruleset for Autonomous Fleet",
                status: "not-published",
                editedAt: "Drafted 3 days ago",
                tools: ["Docker", "Postgres"],
                href: "/admin/settings",
              },
            ]}
          />
        </div>
      </section>

      {/* 4. Recently Updated Platform Activity */}
      <section>
        <RecentlyUpdatedPanel
          title="Platform Activity & Service Status"
          items={[
            {
              id: "adm-srv-1",
              title: "Autonomous Fleet Telemetry Gateway",
              tools: ["docker", "postgres", "python"],
              status: "ON",
              updatedAt: "Operational • 12ms p95 latency",
              href: "/admin/settings",
            },
            {
              id: "adm-srv-2",
              title: "Stripe Connect Escrow Webhook Ingestion",
              tools: ["postgres", "slack"],
              status: "ON",
              updatedAt: "Operational • 0 errors (24h)",
              href: "/admin/payments",
            },
            {
              id: "adm-srv-3",
              title: "AI Strategist Directory Indexer & Embeddings",
              tools: ["openai", "postgres"],
              status: "ON",
              updatedAt: "Operational • Last re-index 4h ago",
              href: "/admin/users",
            },
          ]}
        />
      </section>
    </div>
  );
}
