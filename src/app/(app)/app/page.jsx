"use client";

import React from "react";
import Link from "next/link";
import { PromptBox } from "@/components/home/prompt-box";
import { QuickStartRow } from "@/components/home/quick-start-card";
import { AttentionList } from "@/components/home/attention-list";
import { DraftsCarousel } from "@/components/home/draft-card";
import { RecentlyUpdatedPanel } from "@/components/home/recently-updated-panel";

export default function AppDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* 1. Prompt Box */}
      <section>
        <PromptBox
          role="CLIENT"
          headline="What would you like to automate today?"
          placeholder="Example: When customer files a refund in Stripe, query Postgres order history, generate summary, and ping manager in Slack."
        />
      </section>

      {/* 2. Quick Actions */}
      <section>
        <QuickStartRow role="CLIENT" />
      </section>

      {/* 3. Two-Up Panels */}
      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-4">
          <AttentionList
            title="Needs your attention"
            seeMoreHref="/client/briefs"
          />
        </div>

        <div className="flex flex-col lg:col-span-8">
          <DraftsCarousel title="Unfinished Automations" />
        </div>
      </section>

      {/* 4. Recently Updated */}
      <section>
        <RecentlyUpdatedPanel />
      </section>
    </div>
  );
}
