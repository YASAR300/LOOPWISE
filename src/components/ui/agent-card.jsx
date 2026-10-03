"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IdentityTile } from "./identity-tile";
import { ToggleSwitch } from "./toggle-switch";
import { KebabMenu } from "./kebab-menu";
import { ToolChipRow } from "./tool-chip";
import { toast } from "./toast";
import {
  Play,
  Pause,
  ExternalLink,
  Settings,
  Copy,
  Trash2,
} from "lucide-react";

export function AgentCard({
  agent,
  onToggleStatus = null,
  onToolClick = null,
  className = "",
}) {
  const [active, setActive] = useState(
    agent.status === "active" ||
      agent.status === "ON" ||
      agent.status === "in-progress"
  );

  const handleToggle = (nextState) => {
    const prevState = active;
    setActive(nextState);

    toast.success(
      nextState ? `Resumed ${agent.name}` : `Paused ${agent.name}`,
      {
        description: nextState
          ? "Agent is now polling and executing triggers."
          : "Agent execution halted.",
        action: {
          label: "Undo",
          onClick: () => {
            setActive(prevState);
            if (onToggleStatus) onToggleStatus(agent.id, prevState);
          },
        },
      }
    );

    if (onToggleStatus) {
      onToggleStatus(agent.id, nextState);
    }
  };

  const kebabItems = [
    {
      label: active ? "Pause agent" : "Resume agent",
      icon: active ? Pause : Play,
      onClick: () => handleToggle(!active),
    },
    {
      label: "Agent configuration",
      icon: Settings,
      onClick: () => {
        window.location.href = agent.href || `/client/agents/${agent.id}`;
      },
    },
    {
      label: "Duplicate agent",
      icon: Copy,
      onClick: () => {
        toast.info(`Duplicating workflow for ${agent.name}...`);
      },
    },
    { separator: true },
    {
      label: "Delete agent",
      icon: Trash2,
      destructive: true,
      onClick: () => {
        toast.error(`Agent ${agent.name} queued for decommissioning.`);
      },
    },
  ];

  return (
    <div
      className={`duration-160 hover:shadow-soft group flex flex-col justify-between rounded-[14px] border border-line bg-panel p-4 transition-all hover:border-line-2 ${className}`}
    >
      <div>
        {/* Top Header: Tile + Title + Toggle + Kebab */}
        <div className="mb-2.5 flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <IdentityTile name={agent.name} id={agent.id} size="md" />
            <Link
              href={agent.href || `/client/agents/${agent.id}`}
              className="truncate text-xs font-semibold leading-tight text-ink transition-colors group-hover:text-brand-indigo"
            >
              {agent.name}
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ToggleSwitch
              checked={active}
              onChange={handleToggle}
              ariaLabel={`Toggle ${agent.name}`}
              size="md"
            />
            <KebabMenu items={kebabItems} />
          </div>
        </div>

        {/* 3-line clamped description */}
        <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-ink-2">
          {agent.description ||
            "Autonomous background worker processing event queues and enterprise webhooks."}
        </p>
      </div>

      {/* Footer: Tool Chips + Last Run Meta */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
        <ToolChipRow
          tools={agent.tools || []}
          onToolClick={onToolClick}
          size="sm"
          max={3}
        />
        <span className="shrink-0 truncate text-[11px] text-ink-3">
          Last run: {agent.lastRun || "Just now"}
        </span>
      </div>
    </div>
  );
}
