"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";
import { ToolChipRow } from "@/components/ui/tool-chip";
import { toast } from "@/components/ui/toast";

const INITIAL_ITEMS = [
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
];

export function RecentlyUpdatedPanel({
  items: initialItems = INITIAL_ITEMS,
  title = "Recently updated",
}) {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(initialItems);

  const toggleStatus = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "ON" ? "OFF" : "ON";
          toast.success(`${item.title} state changed to ${nextStatus}`, {
            action: {
              label: "Undo",
              onClick: () => {
                setItems((curr) =>
                  curr.map((c) =>
                    c.id === id ? { ...c, status: item.status } : c
                  )
                );
              },
            },
          });
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const filteredItems = items.filter((item) => {
    if (filter === "on") return item.status === "ON";
    if (filter === "off") return item.status === "OFF";
    return true;
  });

  return (
    <div className="shadow-2xs rounded-2xl border border-line bg-panel p-5">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between border-b border-line pb-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span>{title}</span>
          <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-xs font-normal text-ink-3">
            {filteredItems.length}
          </span>
        </h2>

        {/* Filter select */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="focus:outline-hidden cursor-pointer rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas-2 focus:ring-2 focus:ring-brand-indigo"
          aria-label="Filter recently updated"
        >
          <option value="all">All recently updated</option>
          <option value="on">Active (On)</option>
          <option value="off">Inactive (Off)</option>
        </select>
      </div>

      {/* Rows */}
      <div className="divide-y divide-line">
        {filteredItems.map((item) => {
          const isOn = item.status === "ON";
          return (
            <div
              key={item.id}
              className="group flex items-center justify-between gap-3 rounded-xl px-1.5 py-3 transition-colors hover:bg-panel-2"
            >
              {/* Left: Icon + Title */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent">
                  <Zap className="h-3.5 w-3.5 fill-brand-accent" />
                </div>
                <Link
                  href={item.href || "#"}
                  className="truncate text-xs font-medium text-ink transition-colors hover:text-brand-indigo"
                >
                  {item.title}
                </Link>
              </div>

              {/* Middle: Tool Chips */}
              <div className="hidden shrink-0 items-center sm:flex">
                <ToolChipRow tools={item.tools} max={3} size="sm" />
              </div>

              {/* Right: On/Off Pill + Relative Time */}
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  title={`Toggle ${item.title}`}
                  className={`cursor-pointer select-none rounded-md border px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                    isOn
                      ? "shadow-xs border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                      : "border-line bg-canvas text-ink-3 hover:border-line-2 hover:text-ink"
                  }`}
                >
                  {isOn ? "On" : "Off"}
                </button>

                <span className="hidden w-32 text-right text-[11px] text-ink-3 md:inline-block">
                  {item.updatedAt}
                </span>

                <ChevronRight className="h-4 w-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
