"use client";

import React from "react";
import { PromptBox } from "@/components/home/prompt-box";
import { QuickStartRow } from "@/components/home/quick-start-card";
import { AttentionList } from "@/components/home/attention-list";
import { DraftsCarousel } from "@/components/home/draft-card";
import { RecentlyUpdatedPanel } from "@/components/home/recently-updated-panel";

export default function ClientDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* 1. Prompt Box & Display Greeting */}
      <section>
        <PromptBox
          role="CLIENT"
          headline="What would you like to automate?"
          placeholder="Example: When a customer contract is signed in HubSpot, parse deliverables, generate onboarding milestone, and notify Slack."
        />
      </section>

      {/* 2. Start From Scratch Row */}
      <section>
        <QuickStartRow role="CLIENT" />
      </section>

      {/* 3. Two-Up Panels: Up next / Attention list & Unfinished Drafts Carousel */}
      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-4">
          <AttentionList
            title="Up next"
            seeMoreHref="/client/briefs"
            items={[
              {
                id: "att-1",
                title: "You can now use LangGraph triggers in your agents",
                meta: "New telemetry feature • Available now",
                href: "/client/agents",
                urgent: false,
              },
              {
                id: "att-2",
                title: "Enterprise notice: SMTP port 25 retirement",
                meta: "Migrate to SendGrid or Amazon SES before Nov 1",
                href: "/app/settings",
                urgent: true,
              },
              {
                id: "att-3",
                title: "Weekly AI hours saved ready for executive review",
                meta: "1,420 net hours automated this cycle",
                href: "/app/roi",
                urgent: false,
              },
            ]}
          />
        </div>

        <div className="flex flex-col lg:col-span-8">
          <DraftsCarousel
            title="Unfinished Briefs & Automations"
            drafts={[
              {
                id: "draft-1",
                title: "SAP Invoice Triage & Line Item Parsing",
                status: "not-published",
                editedAt: "Edited 24 minutes ago",
                tools: ["n8n", "OpenAI", "Slack"],
                href: "/client/briefs/new?id=draft-1",
              },
              {
                id: "draft-2",
                title: "HubSpot High-Value Lead Enrichment Pipeline",
                status: "not-published",
                editedAt: "Edited 3 hours ago",
                tools: ["HubSpot", "Claude", "Make"],
                href: "/client/briefs/new?id=draft-2",
              },
              {
                id: "draft-3",
                title: "SOC 2 Audit Evidence Auto-Extractor",
                status: "draft",
                editedAt: "Edited 1 day ago",
                tools: ["Postgres", "LangGraph", "Docker"],
                href: "/client/briefs/new?id=draft-3",
              },
              {
                id: "draft-4",
                title: "Zendesk Escalation Classifier & Router",
                status: "draft",
                editedAt: "Edited 3 days ago",
                tools: ["Slack", "Zapier", "OpenAI"],
                href: "/client/briefs/new?id=draft-4",
              },
            ]}
          />
        </div>
      </section>

      {/* 4. Recently Updated List Panel */}
      <section>
        <RecentlyUpdatedPanel
          title="Recently updated"
          items={[
            {
              id: "rec-1",
              title: "Customer Support Escalation Triage",
              tools: ["n8n", "slack", "hubspot"],
              status: "ON",
              updatedAt: "Published 2 days ago",
              href: "/client/engagements",
            },
            {
              id: "rec-2",
              title: "Inbound Lead Qualification & CRM Sync",
              tools: ["make", "salesforce", "openai"],
              status: "ON",
              updatedAt: "Published 5 days ago",
              href: "/client/engagements",
            },
            {
              id: "rec-3",
              title: "Multi-Source Meeting Intelligence Parser",
              tools: ["claude", "langgraph", "slack"],
              status: "OFF",
              updatedAt: "Published 12 days ago",
              href: "/client/agents",
            },
            {
              id: "rec-4",
              title: "Contract Risk Analyzer & Markdown Extractor",
              tools: ["python", "docker", "postgres"],
              status: "OFF",
              updatedAt: "Published 17 days ago",
              href: "/client/agents",
            },
            {
              id: "rec-5",
              title: "Competitor Telemetry & Pricing Scraper",
              tools: ["zapier", "postgres", "openai"],
              status: "ON",
              updatedAt: "Published 1 month ago",
              href: "/client/agents",
            },
          ]}
        />
      </section>
    </div>
  );
}
