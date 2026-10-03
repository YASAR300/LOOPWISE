"use client";

import React from "react";

const INTEGRATION_TOOLS = [
  { name: "n8n", badge: "Workflow Engine" },
  { name: "Make", badge: "Enterprise iPaaS" },
  { name: "Zapier", badge: "Ecosystem" },
  { name: "LangGraph", badge: "Agent Swarms" },
  { name: "Claude", badge: "Anthropic" },
  { name: "OpenAI", badge: "GPT-4o & Reasoning" },
  { name: "HubSpot", badge: "CRM Sync" },
  { name: "Salesforce", badge: "Revenue Cloud" },
  { name: "Slack", badge: "Human-in-Loop" },
];

export function ToolMarquee() {
  return (
    <div className="w-full overflow-hidden border-y border-line bg-canvas-2 py-12">
      <div className="mx-auto mb-6 max-w-4xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
          Works with the tools your team already runs
        </p>
      </div>

      <div className="marquee-mask relative w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-6 py-1 sm:gap-10">
          {[...INTEGRATION_TOOLS, ...INTEGRATION_TOOLS].map((tool, idx) => (
            <div
              key={`${tool.name}-${idx}`}
              className="shadow-2xs group flex shrink-0 select-none items-center gap-2.5 rounded-full border border-line bg-panel px-4 py-2 transition-all hover:border-line-2"
            >
              <span className="h-2 w-2 rounded-full bg-brand-accent/80 transition-colors group-hover:bg-brand-accent" />
              <span className="font-display text-xs font-bold tracking-tight text-ink">
                {tool.name}
              </span>
              <span className="rounded bg-canvas-2 px-1.5 py-0.5 text-[11px] text-ink-3">
                {tool.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
