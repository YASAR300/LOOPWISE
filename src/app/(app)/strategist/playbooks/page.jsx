import React from "react";
import Link from "next/link";
import { Award, BookOpen, Download, Share2, Plus } from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = {
  title: "Automation Playbooks & Blueprints | Loopwise",
  description:
    "Enterprise SOP templates, LangGraph scaffolds, and autonomous agent patterns.",
};

const PLAYBOOKS = [
  {
    id: "pb-1",
    title: "Healthcare Prior Authorization Multi-Agent Pattern",
    domain: "Healthcare / HIPAA",
    tools: ["LangGraph", "Claude 3.5", "EHR REST API"],
    downloads: 142,
    status: "published",
  },
  {
    id: "pb-2",
    title: "Legal Due Diligence Automated Dataroom Parser",
    domain: "Corporate M&A",
    tools: ["LlamaIndex", "GPT-4o", "OCR"],
    downloads: 98,
    status: "published",
  },
  {
    id: "pb-3",
    title: "SOC-2 Type II Automated Evidence Harvester",
    domain: "Information Security",
    tools: ["n8n", "AWS Audit Manager", "Postgres"],
    downloads: 215,
    status: "published",
  },
];

export default function StrategistPlaybooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Automation Playbooks & Blueprints
          </h1>
          <p className="text-xs text-ink-3">
            Reusable multi-agent architectures, evaluation benchmarks, and
            deployment templates.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary-orange inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Playbook</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLAYBOOKS.map((pb) => (
          <div
            key={pb.id}
            className="shadow-2xs space-y-3 rounded-xl border border-line bg-panel p-5 transition-all hover:border-line-2"
          >
            <div className="flex items-start justify-between">
              <IdentityTile label={pb.title} size="sm" colorIndex={2} />
              <StatusPill status="success" label="Verified" />
            </div>

            <h3 className="font-display text-sm font-bold text-ink">
              {pb.title}
            </h3>
            <p className="text-2xs text-ink-3">Domain: {pb.domain}</p>

            <div className="flex flex-wrap gap-1 pt-1">
              {pb.tools.map((t) => (
                <span
                  key={t}
                  className="rounded bg-canvas px-2 py-0.5 text-2xs font-medium text-ink-2"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-line pt-3 text-2xs text-ink-3">
              <span>{pb.downloads} client adoptions</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 font-semibold text-brand-indigo hover:text-brand-indigo-hover"
              >
                <Download className="h-3 w-3" />
                <span>Clone SOP</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
