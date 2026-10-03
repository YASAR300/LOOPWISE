"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/panel";

export function AttentionList({
  title = "Needs your attention",
  items = [],
  seeMoreHref = "/client/briefs",
}) {
  const defaultItems = [
    {
      id: "1",
      title: "Invoice PDF Triage Agent requires ERP token renewal",
      meta: "Sap connector • Token expires in 14 hours",
      href: "/client/agents",
      urgent: true,
    },
    {
      id: "2",
      title: "2 new proposal milestones waiting for client review",
      meta: "Engagement: Accounts Payable Triage • Alex Vance",
      href: "/client/proposals",
      urgent: false,
    },
    {
      id: "3",
      title: "Weekly AI telemetry snapshot ready for executive export",
      meta: "1,420 net hours automated this cycle",
      href: "/app/roi",
      urgent: false,
    },
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  return (
    <Panel className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-ink">
            {title}
          </h3>
          <span className="rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-2xs font-bold text-ink-3">
            {displayItems.length}
          </span>
        </div>

        <ul className="space-y-2.5">
          {displayItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group block rounded-lg border border-line bg-canvas p-2.5 transition-colors hover:border-line-2 hover:bg-panel-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-xs font-semibold text-ink transition-colors group-hover:text-brand-indigo">
                    {item.title}
                  </p>
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-ink-3 transition-all group-hover:translate-x-0.5 group-hover:text-brand-indigo" />
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-3">
                  {item.meta}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <Link
          href={seeMoreHref}
          className="btn-secondary-outline flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
        >
          <span>See more updates</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Panel>
  );
}
