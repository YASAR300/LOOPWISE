"use client";

import React from "react";
import { PromptBox } from "@/components/home/prompt-box";
import { QuickStartRow } from "@/components/home/quick-start-card";
import { AttentionList } from "@/components/home/attention-list";
import { DraftsCarousel } from "@/components/home/draft-card";
import { RecentlyUpdatedPanel } from "@/components/home/recently-updated-panel";

export default function StrategistDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* 1. Prompt Box */}
      <section>
        <PromptBox
          role="STRATEGIST"
          headline="What engagement are you looking for?"
          placeholder="Example: 15h/wk fractional lead role in healthtech or fintech automating underwriting workflows..."
        />
      </section>

      {/* 2. Quick Actions */}
      <section>
        <QuickStartRow role="STRATEGIST" />
      </section>

      {/* 3. Two-Up Panels */}
      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-4">
          <AttentionList
            title="Active engagements"
            seeMoreHref="/strategist/engagements"
            items={[
              {
                id: "eng-1",
                title: "Apex Logistics: Milestone 2 sign-off required",
                meta: "LangGraph routing • 12 billable hours pending",
                href: "/strategist/engagements",
                urgent: true,
              },
              {
                id: "eng-2",
                title: "3 prospective enterprise matches awaiting your reply",
                meta: "Acme Corp, CloudScale, Veloce Health",
                href: "/strategist/jobs",
                urgent: false,
              },
              {
                id: "eng-3",
                title: "Bi-weekly escrow release ready for transfer",
                meta: "$8,250 net payout • Stripe Connect",
                href: "/strategist/earnings",
                urgent: false,
              },
            ]}
          />
        </div>

        <div className="flex flex-col lg:col-span-8">
          <DraftsCarousel
            title="Draft Proposals & Playbooks"
            drafts={[
              {
                id: "sp-1",
                title: "Enterprise Multi-Agent Customer Support Topology",
                status: "draft",
                editedAt: "Edited 45 minutes ago",
                tools: ["LangGraph", "Claude", "Slack"],
                href: "/strategist/playbooks",
              },
              {
                id: "sp-2",
                title: "Financial Statement OCR & ERP Sync Architecture",
                status: "not-published",
                editedAt: "Edited yesterday",
                tools: ["Python", "Postgres", "Docker"],
                href: "/strategist/playbooks",
              },
              {
                id: "sp-3",
                title: "HubSpot to Salesforce Custom Lead Deduplicator",
                status: "draft",
                editedAt: "Edited 4 days ago",
                tools: ["Make", "Zapier"],
                href: "/strategist/playbooks",
              },
            ]}
          />
        </div>
      </section>

      {/* 4. Recently Updated Deployments */}
      <section>
        <RecentlyUpdatedPanel
          title="Deployed Agents & Automations"
          items={[
            {
              id: "strat-rec-1",
              title: "Apex Logistics Multi-Agent Dispatchee",
              tools: ["langgraph", "slack", "postgres"],
              status: "ON",
              updatedAt: "Active • 99.9% uptime",
              href: "/strategist/agents",
            },
            {
              id: "strat-rec-2",
              title: "CloudScale Inbound Ticket Classification Node",
              tools: ["claude", "hubspot", "n8n"],
              status: "ON",
              updatedAt: "Active • 2,410 runs today",
              href: "/strategist/agents",
            },
            {
              id: "strat-rec-3",
              title: "Nightly Data Reconciliation & S3 Archive",
              tools: ["python", "docker", "postgres"],
              status: "OFF",
              updatedAt: "Paused for maintenance",
              href: "/strategist/agents",
            },
          ]}
        />
      </section>
    </div>
  );
}
