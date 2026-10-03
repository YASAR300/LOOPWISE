"use client";

import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

// Recognized tool definitions with distinct brand colors and icons/glyphs
const TOOL_DEFINITIONS = {
  n8n: {
    name: "n8n",
    glyph: "n8",
    bg: "bg-[#EA4B71]/15",
    text: "text-[#EA4B71]",
    border: "border-[#EA4B71]/30",
  },
  make: {
    name: "Make",
    glyph: "M",
    bg: "bg-[#6D3FF3]/15",
    text: "text-[#6D3FF3]",
    border: "border-[#6D3FF3]/30",
  },
  zapier: {
    name: "Zapier",
    glyph: "_*",
    bg: "bg-[#FF4A00]/15",
    text: "text-[#FF4A00]",
    border: "border-[#FF4A00]/30",
  },
  langgraph: {
    name: "LangGraph",
    glyph: "LG",
    bg: "bg-[#4B3FD6]/15",
    text: "text-[#4B3FD6]",
    border: "border-[#4B3FD6]/30",
  },
  claude: {
    name: "Claude",
    glyph: "C",
    bg: "bg-[#D97706]/15",
    text: "text-[#D97706]",
    border: "border-[#D97706]/30",
  },
  openai: {
    name: "OpenAI",
    glyph: "AI",
    bg: "bg-[#10A37F]/15",
    text: "text-[#10A37F]",
    border: "border-[#10A37F]/30",
  },
  hubspot: {
    name: "HubSpot",
    glyph: "HS",
    bg: "bg-[#FF7A59]/15",
    text: "text-[#FF7A59]",
    border: "border-[#FF7A59]/30",
  },
  salesforce: {
    name: "Salesforce",
    glyph: "SF",
    bg: "bg-[#00A1E0]/15",
    text: "text-[#00A1E0]",
    border: "border-[#00A1E0]/30",
  },
  slack: {
    name: "Slack",
    glyph: "#",
    bg: "bg-[#4A154B]/15",
    text: "text-[#E01E5A]",
    border: "border-[#E01E5A]/30",
  },
  postgres: {
    name: "PostgreSQL",
    glyph: "PG",
    bg: "bg-[#336791]/15",
    text: "text-[#336791]",
    border: "border-[#336791]/30",
  },
  python: {
    name: "Python",
    glyph: "Py",
    bg: "bg-[#3776AB]/15",
    text: "text-[#3776AB]",
    border: "border-[#3776AB]/30",
  },
  docker: {
    name: "Docker",
    glyph: "D",
    bg: "bg-[#2496ED]/15",
    text: "text-[#2496ED]",
    border: "border-[#2496ED]/30",
  },
};

function normalizeToolName(tool = "") {
  return tool.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function ToolChip({
  tool,
  onClick = null,
  active = false,
  size = "md", // "sm" (20px), "md" (24px)
  className = "",
}) {
  if (!tool) return null;
  const toolStr = typeof tool === "string" ? tool : tool.name || String(tool);
  const key = normalizeToolName(toolStr);
  const def = TOOL_DEFINITIONS[key] || {
    name: toolStr,
    glyph: toolStr.charAt(0).toUpperCase(),
    bg: "bg-canvas-2 dark:bg-panel-2",
    text: "text-ink-2",
    border: "border-line dark:border-line-2",
  };

  const sizeClasses =
    {
      sm: "h-5 px-1.5 text-[10px] gap-1",
      md: "h-6 px-2 text-[11px] gap-1.5",
    }[size] || "h-6 px-2 text-[11px] gap-1.5";

  const chipElement = (
    <button
      type="button"
      onClick={onClick ? () => onClick(def.name) : undefined}
      disabled={!onClick}
      className={`inline-flex shrink-0 select-none items-center rounded-md border font-medium transition-all ${sizeClasses} ${
        def.bg
      } ${def.text} ${def.border} ${
        active
          ? "shadow-xs font-bold ring-2 ring-brand-indigo ring-offset-1 ring-offset-panel"
          : ""
      } ${
        onClick
          ? "hover:scale-102 active:scale-98 cursor-pointer hover:opacity-85"
          : "cursor-default"
      } ${className}`}
      aria-label={`Tool: ${def.name}`}
    >
      <span className="font-mono font-bold tracking-tight">{def.glyph}</span>
      <span className="max-w-[80px] truncate">{def.name}</span>
    </button>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{chipElement}</TooltipTrigger>
        <TooltipContent side="top" className="text-2xs font-medium">
          {onClick ? `Filter by ${def.name}` : def.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ToolChipRow({
  tools = [],
  onSelectTool = null,
  selectedTool = null,
  limit = 4,
}) {
  if (!tools || tools.length === 0) return null;
  const visible = tools.slice(0, limit);
  const remaining = tools.length - limit;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((t, idx) => {
        const tName = typeof t === "string" ? t : t.name;
        return (
          <ToolChip
            key={`${tName}-${idx}`}
            tool={t}
            active={
              selectedTool &&
              normalizeToolName(selectedTool) === normalizeToolName(tName)
            }
            onClick={onSelectTool}
          />
        );
      })}
      {remaining > 0 && (
        <span className="rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
          +{remaining}
        </span>
      )}
    </div>
  );
}
