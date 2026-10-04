"use client";

import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

// Recognized tool definitions with authentic brand colors and clean metadata
const TOOL_DEFINITIONS = {
  n8n: {
    name: "n8n",
    dot: "#EA4B71",
    bg: "bg-[#EA4B71]/8",
    border: "border-[#EA4B71]/25",
  },
  make: {
    name: "Make",
    dot: "#6D3FF3",
    bg: "bg-[#6D3FF3]/8",
    border: "border-[#6D3FF3]/25",
  },
  zapier: {
    name: "Zapier",
    dot: "#FF4A00",
    bg: "bg-[#FF4A00]/8",
    border: "border-[#FF4A00]/25",
  },
  langgraph: {
    name: "LangGraph",
    dot: "#4B3FD6",
    bg: "bg-[#4B3FD6]/8",
    border: "border-[#4B3FD6]/25",
  },
  claude: {
    name: "Claude",
    dot: "#D97706",
    bg: "bg-[#D97706]/8",
    border: "border-[#D97706]/25",
  },
  openai: {
    name: "OpenAI",
    dot: "#10A37F",
    bg: "bg-[#10A37F]/8",
    border: "border-[#10A37F]/25",
  },
  hubspot: {
    name: "HubSpot",
    dot: "#FF7A59",
    bg: "bg-[#FF7A59]/8",
    border: "border-[#FF7A59]/25",
  },
  salesforce: {
    name: "Salesforce",
    dot: "#00A1E0",
    bg: "bg-[#00A1E0]/8",
    border: "border-[#00A1E0]/25",
  },
  slack: {
    name: "Slack",
    dot: "#E01E5A",
    bg: "bg-[#E01E5A]/8",
    border: "border-[#E01E5A]/25",
  },
  postgres: {
    name: "PostgreSQL",
    dot: "#336791",
    bg: "bg-[#336791]/8",
    border: "border-[#336791]/25",
  },
  postgresql: {
    name: "PostgreSQL",
    dot: "#336791",
    bg: "bg-[#336791]/8",
    border: "border-[#336791]/25",
  },
  python: {
    name: "Python",
    dot: "#3776AB",
    bg: "bg-[#3776AB]/8",
    border: "border-[#3776AB]/25",
  },
  docker: {
    name: "Docker",
    dot: "#2496ED",
    bg: "bg-[#2496ED]/8",
    border: "border-[#2496ED]/25",
  },
  netsuite: {
    name: "NetSuite",
    dot: "#1B365D",
    bg: "bg-[#1B365D]/8",
    border: "border-[#1B365D]/25",
  },
  jira: {
    name: "Jira",
    dot: "#0052CC",
    bg: "bg-[#0052CC]/8",
    border: "border-[#0052CC]/25",
  },
  supabase: {
    name: "Supabase",
    dot: "#3ECF8E",
    bg: "bg-[#3ECF8E]/8",
    border: "border-[#3ECF8E]/25",
  },
};

function normalizeToolName(tool = "") {
  return String(tool)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function ToolChip({
  tool,
  onClick = null,
  active = false,
  size = "sm", // "sm" (compact table pill) | "md" (standard badge)
  className = "",
}) {
  if (!tool) return null;
  const toolStr = typeof tool === "string" ? tool : tool.name || String(tool);
  const key = normalizeToolName(toolStr);
  const def = TOOL_DEFINITIONS[key] || {
    name: toolStr,
    dot: "#8C877C",
    bg: "bg-panel-2",
    border: "border-line",
  };

  const isSmall = size === "sm";

  const chipElement = (
    <button
      type="button"
      onClick={onClick ? () => onClick(def.name) : undefined}
      disabled={!onClick}
      className={`inline-flex shrink-0 select-none items-center rounded-full border transition-all ${
        isSmall ? "h-5 gap-1.5 px-2 text-[11px]" : "h-6 gap-1.5 px-2.5 text-xs"
      } ${def.border} ${def.bg} bg-panel/90 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
        active
          ? "border-brand-indigo font-semibold ring-2 ring-brand-indigo ring-offset-1 ring-offset-panel"
          : "hover:border-line-2 hover:bg-panel-2"
      } ${
        onClick
          ? "hover:scale-102 active:scale-98 cursor-pointer"
          : "cursor-default"
      } ${className}`}
      aria-label={`Tool: ${def.name}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: def.dot }}
        aria-hidden="true"
      />
      <span className="max-w-[90px] truncate font-medium tracking-tight text-ink">
        {def.name}
      </span>
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
  onToolClick = null,
  onSelectTool = null,
  selectedTool = null,
  limit = 2,
  max = null,
  size = "sm",
}) {
  const handler = onToolClick || onSelectTool;
  const effectiveLimit = max !== null ? max : limit;

  if (!tools || tools.length === 0) return null;
  const visible = tools.slice(0, effectiveLimit);
  const remaining = tools.slice(effectiveLimit);

  return (
    <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
      {visible.map((t, idx) => {
        const tName = typeof t === "string" ? t : t.name;
        return (
          <ToolChip
            key={`${tName}-${idx}`}
            tool={t}
            size={size}
            active={
              selectedTool &&
              normalizeToolName(selectedTool) === normalizeToolName(tName)
            }
            onClick={handler}
          />
        );
      })}

      {remaining.length > 0 && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex h-5 shrink-0 cursor-default select-none items-center rounded-full border border-line bg-panel-2 px-1.5 text-[10px] font-medium text-ink-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:border-line-2 hover:text-ink">
                +{remaining.length}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-2xs font-medium">
              {remaining
                .map((r) => (typeof r === "string" ? r : r.name))
                .join(", ")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
