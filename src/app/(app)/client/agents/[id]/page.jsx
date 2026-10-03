"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Play,
  Pause,
  Save,
  Check,
  Send,
  MessageSquare,
  Activity,
  History,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { ToolChipRow } from "@/components/ui/tool-chip";
import { StatusPill } from "@/components/ui/status-pill";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { WarmTelemetryChart } from "@/components/ui/warm-telemetry-chart";
import { toast } from "@/components/ui/toast";

export default function AgentDetailPage({ params }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams?.id || "agent-1";

  // Left Main Editable States
  const [title, setTitle] = useState("User insights agent");
  const [description, setDescription] = useState(
    "After each research session, this agent automatically summarizes the conversation and tags key themes like pain points, goals, and feature requests. It pushes clean takeaways to Slack."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedAgo, setSavedAgo] = useState("All changes saved");

  // Right Properties Panel States
  const [status, setStatus] = useState("in-progress");
  const [owner, setOwner] = useState("Elena Rostova (Lead AI Strategist)");
  const [cadence, setCadence] = useState("Event triggered (Continuous)");
  const [slaTarget, setSlaTarget] = useState("99.9% Uptime");
  const [active, setActive] = useState(true);
  const [tools, setTools] = useState(["slack", "langgraph", "claude"]);

  // Comments / Timeline
  const [comments, setComments] = useState([
    {
      id: "c1",
      author: "Elena Rostova",
      time: "2 hours ago",
      text: "Updated prompt weights to give higher priority to enterprise contract objections.",
    },
    {
      id: "c2",
      author: "Alex Vance",
      time: "Yesterday",
      text: "Verified Slack webhook token integration in production workspace.",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleTitleChange = (val) => {
    setTitle(val);
    triggerAutoSave();
  };

  const handleDescChange = (val) => {
    setDescription(val);
    triggerAutoSave();
  };

  const triggerAutoSave = () => {
    setIsSaving(true);
    setSavedAgo("Saving...");
    setTimeout(() => {
      setIsSaving(false);
      setSavedAgo("Saved just now");
    }, 600);
  };

  const handleToggle = (nextState) => {
    const prev = active;
    setActive(nextState);
    toast.success(nextState ? "Agent resumed" : "Agent paused", {
      action: {
        label: "Undo",
        onClick: () => setActive(prev),
      },
    });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "You",
        time: "Just now",
        text: newComment.trim(),
      },
    ]);
    setNewComment("");
    toast.success("Comment added to activity timeline");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/client/agents"
            className="rounded-lg border border-line bg-panel p-1.5 text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
            aria-label="Back to agents"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <IdentityTile name={title} id={agentId} size="sm" />
            <span className="text-xs text-ink-3">/</span>
            <span className="font-mono text-xs text-ink-3">
              agent-{agentId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-ink-3">{savedAgo}</span>
          <ToggleSwitch
            checked={active}
            onChange={handleToggle}
            ariaLabel="Toggle agent execution"
            size="md"
          />
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Main Editor, Telemetry Chart, Sections, Activity Timeline */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Title & Description */}
          <div className="shadow-2xs space-y-4 rounded-[14px] border border-line bg-panel p-6">
            <div>
              <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-3">
                Agent Name (Click to edit)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="focus:outline-hidden w-full border-b border-transparent bg-transparent py-1 text-xl font-bold text-ink transition-colors hover:border-line focus:border-brand-indigo sm:text-2xl"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-3">
                Purpose & Execution Logic
              </label>
              <textarea
                value={description}
                onChange={(e) => handleDescChange(e.target.value)}
                rows={3}
                className="focus:outline-hidden w-full resize-none rounded-lg border border-line bg-panel-2 p-3 text-xs leading-relaxed text-ink-2 transition-all focus:ring-2 focus:ring-brand-indigo sm:text-sm"
              />
            </div>
          </div>

          {/* Warm Telemetry Chart (No Gridlines, 2px stroke, 10% fill) */}
          <div className="shadow-2xs space-y-4 rounded-[14px] border border-line bg-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Execution Telemetry (24h)
                </h3>
                <p className="text-xs text-ink-3">
                  Autonomous run frequency and webhook trigger volume
                </p>
              </div>
              <span className="rounded border border-line bg-panel-2 px-2 py-0.5 font-mono text-xs text-ink-2">
                2,715 runs total
              </span>
            </div>

            <WarmTelemetryChart
              metricKey="runs"
              metricLabel="runs"
              strokeColor="#4B3FD6"
              height={170}
            />
          </div>

          {/* Activity Timeline & Comments */}
          <div className="shadow-2xs space-y-4 rounded-[14px] border border-line bg-panel p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Activity className="h-4 w-4 text-brand-indigo" />
              <span>Activity & Comment Stream</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="space-y-1 rounded-xl border border-line bg-panel-2 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">
                      {comment.author}
                    </span>
                    <span className="font-mono text-[11px] text-ink-3">
                      {comment.time}
                    </span>
                  </div>
                  <p className="leading-relaxed text-ink-2">{comment.text}</p>
                </div>
              ))}
            </div>

            {/* Comment Composer */}
            <form
              onSubmit={handleAddComment}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Leave an engineering note or instruction..."
                className="focus:outline-hidden flex-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-ink focus:ring-2 focus:ring-brand-indigo"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="btn-primary-indigo flex items-center gap-1.5 px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Properties Panel with Instant-Save Dropdowns */}
        <div className="space-y-5 lg:col-span-4">
          <div className="shadow-2xs space-y-4 rounded-[14px] border border-line bg-panel p-5">
            <h3 className="border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-ink-3">
              Properties
            </h3>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-ink-3">
                Lifecycle State
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  toast.success(`Agent status updated to ${e.target.value}`);
                }}
                className="w-full cursor-pointer rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-xs font-semibold text-ink focus:ring-2 focus:ring-brand-indigo"
              >
                <option value="in-progress">In progress (Active)</option>
                <option value="needs-action">Needs action</option>
                <option value="complete">Complete (Stable)</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Owner Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-ink-3">
                Assigned Lead
              </label>
              <select
                value={owner}
                onChange={(e) => {
                  setOwner(e.target.value);
                  toast.success(`Owner assigned to ${e.target.value}`);
                }}
                className="w-full cursor-pointer rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-xs font-semibold text-ink focus:ring-2 focus:ring-brand-indigo"
              >
                <option value="Elena Rostova (Lead AI Strategist)">
                  Elena Rostova (Lead AI Strategist)
                </option>
                <option value="Marcus Vance (Solutions Architect)">
                  Marcus Vance (Solutions Architect)
                </option>
                <option value="Unassigned / Internal">
                  Unassigned / Internal
                </option>
              </select>
            </div>

            {/* Cadence */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-ink-3">
                Trigger Schedule
              </label>
              <input
                type="text"
                value={cadence}
                onChange={(e) => setCadence(e.target.value)}
                className="w-full rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-xs text-ink focus:ring-2 focus:ring-brand-indigo"
              />
            </div>

            {/* SLA Target */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-ink-3">
                SLA Guarantee
              </label>
              <input
                type="text"
                value={slaTarget}
                onChange={(e) => setSlaTarget(e.target.value)}
                className="w-full rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 font-mono text-xs text-ink focus:ring-2 focus:ring-brand-indigo"
              />
            </div>

            {/* Connected Tools */}
            <div className="space-y-2 border-t border-line pt-2">
              <label className="block text-[11px] font-medium text-ink-3">
                Integrated Frameworks
              </label>
              <ToolChipRow tools={tools} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
