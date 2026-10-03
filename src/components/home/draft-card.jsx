"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileEdit,
  AlertCircle,
} from "lucide-react";
import { ToolChipRow } from "@/components/ui/tool-chip";
import { StatusPill } from "@/components/ui/status-pill";
import { Panel } from "@/components/ui/panel";

const INITIAL_DRAFTS = [
  {
    id: "draft-1",
    title: "SAP Invoice Triage & Line Extraction",
    status: "not-published",
    editedAt: "Edited 24 minutes ago",
    tools: ["n8n", "OpenAI", "Slack"],
    href: "/client/briefs/new?id=draft-1",
  },
  {
    id: "draft-2",
    title: "HubSpot High-Value Lead Enrichment",
    status: "not-published",
    editedAt: "Edited 3 hours ago",
    tools: ["HubSpot", "Claude", "Make"],
    href: "/client/briefs/new?id=draft-2",
  },
  {
    id: "draft-3",
    title: "SOC 2 Audit Telemetry Extraction",
    status: "draft",
    editedAt: "Edited 1 day ago",
    tools: ["Postgres", "LangGraph"],
    href: "/client/briefs/new?id=draft-3",
  },
];

export function DraftsCarousel({
  title = "Unfinished Drafts",
  drafts = INITIAL_DRAFTS,
}) {
  const [items, setItems] = useState(drafts);
  const [deletedItem, setDeletedItem] = useState(null);
  const scrollRef = useRef(null);

  const handleDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const itemToDelete = items.find((it) => it.id === id);
    if (!itemToDelete) return;

    setItems((prev) => prev.filter((it) => it.id !== id));
    setDeletedItem(itemToDelete);

    // Auto-clear undo after 5 seconds
    setTimeout(() => {
      setDeletedItem(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (!deletedItem) return;
    setItems((prev) => [deletedItem, ...prev]);
    setDeletedItem(null);
  };

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <Panel className="relative flex h-full flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-ink">
              {title}
            </h3>
            <span className="rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-2xs font-bold text-ink-3">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollBy(-240)}
              className="rounded-full border border-line bg-panel-2 p-1 text-ink-3 transition-colors hover:bg-canvas hover:text-ink"
              aria-label="Previous drafts"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(240)}
              className="rounded-full border border-line bg-panel-2 p-1 text-ink-3 transition-colors hover:bg-canvas hover:text-ink"
              aria-label="Next drafts"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Row */}
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-3">
            No unfinished drafts. Create a new brief from the prompt above.
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="scrollbar-none flex items-stretch gap-3 overflow-x-auto pb-2"
          >
            {items.map((draft) => (
              <div
                key={draft.id}
                className="hover:shadow-2xs group flex w-56 shrink-0 flex-col justify-between space-y-3 rounded-xl border border-line bg-canvas p-3.5 transition-all hover:border-line-2"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <StatusPill status="not-published" label="Not published" />
                    <button
                      type="button"
                      onClick={(e) => handleDelete(draft.id, e)}
                      title="Discard draft"
                      className="rounded p-1 text-ink-3 transition-colors hover:bg-[#FFECEC] hover:text-[#B42318] dark:hover:bg-[#331515]"
                      aria-label="Discard draft"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <ToolChipRow tools={draft.tools} limit={3} />
                </div>

                <div className="border-t border-line pt-2">
                  <p className="mb-0.5 text-[10px] text-ink-3">
                    {draft.editedAt}
                  </p>
                  <Link
                    href={draft.href}
                    className="line-clamp-1 block text-xs font-semibold text-ink transition-colors hover:text-brand-indigo"
                  >
                    {draft.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Undo Banner if item was deleted */}
      {deletedItem && (
        <div className="animate-in fade-in mt-3 flex items-center justify-between rounded-lg border border-line bg-panel-2 p-2 text-xs">
          <span className="truncate text-ink-2">
            Draft discarded: <strong>{deletedItem.title}</strong>
          </span>
          <button
            type="button"
            onClick={handleUndo}
            className="ml-2 shrink-0 text-xs font-bold text-brand-indigo hover:underline"
          >
            Undo
          </button>
        </div>
      )}
    </Panel>
  );
}
