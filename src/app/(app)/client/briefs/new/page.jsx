"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Send, Layers } from "lucide-react";
import { toast } from "@/components/ui/toast";

const COMMON_SKILLS = [
  "LangGraph",
  "Claude 3.7 Sonnet",
  "n8n",
  "CrewAI",
  "LlamaIndex",
  "AutoGPT",
  "Make.com",
  "Zapier Central",
  "HIPAA Compliance",
  "EU AI Act",
];

export default function NewBriefPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [budget, setBudget] = useState("10k-25k");
  const [timeline, setTimeline] = useState("4-8 weeks");
  const [selectedSkills, setSelectedSkills] = useState(["LangGraph", "n8n"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Title required",
        description:
          "Please enter a descriptive title for your workflow brief.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Brief created successfully!",
        description:
          "Your brief is now active and matching with vetted Fractional CAIOs.",
        variant: "default",
      });
      router.push("/client/briefs");
    }, 600);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/client/briefs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to briefs</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Post a New Automation Brief
        </h1>
        <p className="text-xs text-ink-3">
          Specify the internal workflow, target systems, and desired autonomous
          agent outcomes.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="shadow-2xs space-y-6 rounded-2xl border border-line bg-panel p-6 sm:p-8"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Brief Title <span className="text-brand-accent">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deploy autonomous document processing swarm for underwriting"
            className="input-base w-full"
          />
        </div>

        {/* Workflow Summary */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Current Workflow & Bottlenecks{" "}
            <span className="text-brand-accent">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe what human steps are currently taken, which software apps are used, and the volume per week..."
            className="input-base w-full py-2.5 leading-relaxed"
          />
        </div>

        {/* Budget & Timeline */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              Target Budget Range
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input-base w-full"
            >
              <option value="5k-10k">$5,000 - $10,000</option>
              <option value="10k-25k">$10,000 - $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="50k+">$50,000+ Enterprise</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              Estimated Timeline
            </label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="input-base w-full"
            >
              <option value="2-4 weeks">2 - 4 weeks (Rapid sprint)</option>
              <option value="4-8 weeks">4 - 8 weeks (Standard rollout)</option>
              <option value="2-3 months">
                2 - 3 months (Deep multi-agent architecture)
              </option>
              <option value="ongoing">Ongoing fractional retainer</option>
            </select>
          </div>
        </div>

        {/* Desired Stack & Frameworks */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink">
            Preferred Frameworks & Tooling
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-brand-indigo/10 border-brand-indigo font-semibold text-brand-indigo"
                      : "border-line bg-canvas text-ink-3 hover:border-line-2 hover:text-ink"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit row */}
        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Link
            href="/client/briefs"
            className="rounded-lg px-4 py-2 text-xs font-medium text-ink-3 hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              {isSubmitting ? "Publishing brief..." : "Publish Brief & Match"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
