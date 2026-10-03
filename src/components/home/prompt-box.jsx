"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send } from "lucide-react";

export function PromptBox({
  role = "CLIENT",
  headline = "What would you like to automate?",
  placeholder = null,
  onSubmit = null,
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const defaultPlaceholder =
    role === "STRATEGIST"
      ? "Example: Looking for 20h/wk enterprise LangGraph migration in fintech..."
      : role === "ADMIN"
        ? "Example: Search user by email, company, or flagged audit log..."
        : "Example: When an enterprise vendor invoice arrives via PDF, extract line items, verify Tax ID in SAP, and route to Finance VP.";

  const effectivePlaceholder = placeholder || defaultPlaceholder;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSubmit) {
      onSubmit(query);
      return;
    }

    if (role === "STRATEGIST") {
      router.push(`/strategist/jobs?q=${encodeURIComponent(query)}`);
    } else if (role === "ADMIN") {
      router.push(`/admin/users?q=${encodeURIComponent(query)}`);
    } else {
      // Client: routes to workflow mapper / new brief with prompt
      router.push(`/client/briefs/new?prompt=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Headline + AI Beta Chip */}
      <div className="flex items-center gap-2.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {headline}
        </h1>
        <span className="rounded-full border border-brand-accent/20 bg-brand-accent-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-accent">
          AI beta
        </span>
      </div>

      {/* Wide Prompt Input with Thin Gradient Border */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="prompt-box-gradient shadow-2xs relative flex items-center p-1.5">
          <div className="pl-2.5 pr-1 text-brand-accent">
            <Sparkles className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={effectivePlaceholder}
            className="flex-1 bg-transparent px-2.5 py-2 text-xs text-ink placeholder:text-ink-3 focus:outline-none sm:text-sm"
          />

          <button
            type="submit"
            disabled={!query.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-panel transition-all hover:bg-brand-indigo disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Submit automation prompt"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
