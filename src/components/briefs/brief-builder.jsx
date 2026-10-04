"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
  Lock,
  Globe,
  DollarSign,
  Clock,
  Target,
  Send,
  Plus,
  Trash2,
} from "lucide-react";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LogoLoader } from "@/components/ui/logo-loader";

const STEPS = [
  { id: 1, title: "Goal & Stack", description: "Objectives & tools" },
  { id: 2, title: "Scope & Metrics", description: "Problem & targets" },
  { id: 3, title: "Commercials", description: "Budget & skills" },
  { id: 4, title: "Workflows & Publish", description: "Mapping & launch" },
];

const GOAL_PRESETS = [
  {
    id: "reduce_support_load",
    title: "Reduce Customer Support Load",
    description:
      "Automate tier-1 inquiry triage, resolution, and CRM lookups with LLM supervisors.",
  },
  {
    id: "accelerate_sales_ops",
    title: "Accelerate Sales Operations",
    description:
      "Enrich leads, draft customized proposals, and synchronize CRM/ERP fields autonomously.",
  },
  {
    id: "automate_finance_backoffice",
    title: "Automate Finance Back-Office",
    description:
      "Parse invoices, reconcile statements, and generate compliance ledger entries.",
  },
  {
    id: "build_internal_copilots",
    title: "Deploy Internal Copilots & Tool-Calling",
    description:
      "Equip team with multi-agent assistants connected to internal SQL, vector search & Slack.",
  },
  {
    id: "governance_setup",
    title: "AI Governance, Security & Compliance",
    description:
      "Establish guardrails, evaluate hallucination rates, and achieve SOC 2 / ISO 42001.",
  },
  {
    id: "custom",
    title: "Custom Strategic Mandate",
    description:
      "Specific multi-system architecture designed by a dedicated Fractional Head of AI.",
  },
];

const SKILLS_LIST = [
  "LangGraph",
  "Claude 3.5/3.7 API",
  "OpenAI GPT-4o",
  "n8n Automation",
  "Make / Integromat",
  "Python / FastAPI",
  "LlamaIndex",
  "PostgreSQL & pgvector",
  "DSPy Prompt Optimization",
  "Docker & Kubernetes",
  "SOC 2 Compliance",
  "BPMN Process Mapping",
];

const TIMELINE_OPTIONS = [
  "Immediate (next 1-2 weeks)",
  "Within 30 days",
  "Within 60 days",
  "Flexible / Planning phase",
];

export function BriefBuilder({ briefId = null }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(Boolean(briefId));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeBriefId, setActiveBriefId] = useState(briefId);
  const [errorMsg, setErrorMsg] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    goal: "reduce_support_load",
    teamSize: "11-50 employees",
    currentTools: ["Salesforce", "Slack", "Zendesk"],
    problemDescription: "",
    targetOutcomes: "",
    successMetrics: [
      {
        metric: "Weekly Support Hours Saved",
        target: "65%",
        timeframe: "60 days",
      },
    ],
    timeline: "Immediate (next 1-2 weeks)",
    hoursPerWeek: 20,
    budgetMin: 6000,
    budgetMax: 12000,
    preferredModel: "RETAINER",
    requiredSkills: ["LangGraph", "Claude 3.5/3.7 API", "Python / FastAPI"],
    complianceNeeds: ["SOC 2 Compliance"],
    timezonePref: "US / European overlap",
    isNdaRequired: true,
    status: "DRAFT",
    workflows: [],
  });

  // Load existing brief
  useEffect(() => {
    if (!briefId) return;

    async function loadBrief() {
      try {
        setLoading(true);
        const res = await fetch(`/api/client/briefs/${briefId}`);
        if (res.ok) {
          const data = await res.json();
          const b = data.brief;
          setForm({
            title: b.title || "",
            goal: b.goal || "reduce_support_load",
            teamSize: b.teamSize || "11-50 employees",
            currentTools: Array.isArray(b.currentTools) ? b.currentTools : [],
            problemDescription: b.problemDescription || "",
            targetOutcomes: b.targetOutcomes || "",
            successMetrics: [
              {
                metric: "Resolution Cycle Time",
                target: "70% faster",
                timeframe: "45 days",
              },
            ],
            timeline: b.timeline || "Immediate (next 1-2 weeks)",
            hoursPerWeek: b.hoursPerWeek || 20,
            budgetMin: b.budgetMin || 6000,
            budgetMax: b.budgetMax || 12000,
            preferredModel: b.preferredModel || "RETAINER",
            requiredSkills: Array.isArray(b.requiredSkills)
              ? b.requiredSkills
              : [],
            complianceNeeds: Array.isArray(b.complianceNeeds)
              ? b.complianceNeeds
              : [],
            timezonePref: b.timezonePref || "Any",
            isNdaRequired: Boolean(b.isNdaRequired),
            status: b.status || "DRAFT",
            workflows: b.workflows || [],
          });
        }
      } catch (err) {
        console.error("Failed to load brief", err);
      } finally {
        setLoading(false);
      }
    }

    loadBrief();
  }, [briefId]);

  // Autosave function
  const saveDraft = useCallback(
    async (formData, targetStep = null) => {
      try {
        setSaving(true);
        setErrorMsg(null);

        const payload = {
          title:
            formData.title ||
            (formData.goal
              ? `Automation Brief: ${formData.goal.replace(/_/g, " ")}`
              : "Untitled Brief"),
          goal: formData.goal,
          teamSize: formData.teamSize,
          currentTools: formData.currentTools,
          problemDescription: formData.problemDescription,
          targetOutcomes: formData.targetOutcomes,
          timeline: formData.timeline,
          hoursPerWeek: Number(formData.hoursPerWeek),
          budgetMin: Number(formData.budgetMin),
          budgetMax: Number(formData.budgetMax),
          preferredModel: formData.preferredModel,
          requiredSkills: formData.requiredSkills,
          complianceNeeds: formData.complianceNeeds,
          timezonePref: formData.timezonePref,
          isNdaRequired: formData.isNdaRequired,
        };

        if (activeBriefId) {
          const res = await fetch(`/api/client/briefs/${activeBriefId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            setLastSaved(
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            );
          }
        } else {
          const res = await fetch("/api/client/briefs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            setActiveBriefId(data.brief.id);
            setLastSaved(
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            );
            // Silently update URL without reload
            window.history.replaceState(
              null,
              "",
              `/client/briefs/${data.brief.id}/edit`
            );
          }
        }
      } catch (err) {
        console.error("Autosave error", err);
      } finally {
        setSaving(false);
      }
    },
    [activeBriefId]
  );

  const handleNext = async () => {
    await saveDraft(form);
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePublish = async () => {
    if (!activeBriefId) {
      await saveDraft(form);
    }
    if (!activeBriefId) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      setValidationErrors([]);

      const res = await fetch(`/api/client/briefs/${activeBriefId}/publish`, {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Validation failed before publishing");
        setValidationErrors(json.validationErrors || []);
        return;
      }

      setPublishSuccess(true);
      setForm((prev) => ({ ...prev, status: "PUBLISHED" }));
      setTimeout(() => {
        router.push("/client/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Publish error", err);
      setErrorMsg("Failed to publish brief");
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill],
    }));
  };

  const addMetric = () => {
    setForm((prev) => ({
      ...prev,
      successMetrics: [
        ...prev.successMetrics,
        { metric: "Metric Name", target: "Target Value", timeframe: "30 days" },
      ],
    }));
  };

  const removeMetric = (index) => {
    setForm((prev) => ({
      ...prev,
      successMetrics: prev.successMetrics.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Loading brief editor...
        </p>
      </div>
    );
  }

  // Completeness flags for publish checklist
  const hasTitle = Boolean(form.title && form.title.trim().length >= 5);
  const hasDescription = Boolean(
    form.problemDescription && form.problemDescription.trim().length >= 20
  );
  const hasBudget = Boolean(
    form.budgetMin && form.budgetMax && form.budgetMin <= form.budgetMax
  );
  const hasSkills = Boolean(form.requiredSkills.length >= 1);
  const hasWorkflows = Boolean(form.workflows && form.workflows.length >= 1);
  const isReadyToPublish = hasTitle && hasDescription && hasBudget && hasSkills;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header & Autosave Status */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-brand-indigo/30 bg-brand-indigo/5 font-semibold text-brand-indigo"
            >
              Fractional AI Brief Builder
            </Badge>
            {saving ? (
              <span className="text-2xs text-ink-3">Autosaving draft...</span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-2xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Autosaved {lastSaved}
              </span>
            ) : null}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {form.title || "Create New Automation Brief"}
          </h1>
          <p className="text-xs text-ink-3">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}{" "}
            — {STEPS[currentStep - 1].description}
          </p>
        </div>

        {activeBriefId && (
          <Link href={`/client/briefs/${activeBriefId}/workflows`}>
            <Button
              size="sm"
              variant="outline"
              className="bg-surface gap-2 border-line"
            >
              <Zap className="text-brand-orange h-4 w-4" /> Open Workflow Mapper
            </Button>
          </Link>
        )}
      </div>

      {/* Stepper Navigation */}
      <div className="bg-surface shadow-xs rounded-xl border border-line p-4">
        <Stepper steps={STEPS} currentStep={currentStep - 1} />
      </div>

      {errorMsg && (
        <div className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          {validationErrors.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-6 font-normal text-red-700">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {publishSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Brief published successfully! Redirecting to dashboard matching
          pool...
        </div>
      )}

      {/* ================= STEP 1: GOAL & STACK ================= */}
      {currentStep === 1 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div>
            <h2 className="text-base font-bold text-ink">
              1. Core Automation Goal & Stack
            </h2>
            <p className="text-xs text-ink-3">
              Choose an architectural preset or define your custom automation
              requirement.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Preset Mandate Objective
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GOAL_PRESETS.map((preset) => {
                const isSelected = form.goal === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, goal: preset.id }))
                    }
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "bg-brand-indigo/5 shadow-xs border-brand-indigo text-ink"
                        : "hover:border-line-hover border-line bg-canvas text-ink-3"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">
                        {preset.title}
                      </span>
                      <input
                        type="radio"
                        checked={isSelected}
                        readOnly
                        className="accent-brand-indigo"
                      />
                    </div>
                    <p className="mt-1.5 text-2xs leading-relaxed text-ink-3">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Current Operating Team Size
              </label>
              <select
                className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-xs text-ink outline-none"
                value={form.teamSize}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teamSize: e.target.value }))
                }
              >
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="201-1,000 employees">201-1,000 employees</option>
                <option value="1,000+ employees">1,000+ employees</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Brief Working Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Autonomous Customer Support & Escalation Triage Engine"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: SCOPE & METRICS ================= */}
      {currentStep === 2 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div>
            <h2 className="text-base font-bold text-ink">
              2. Problem Statement & Success Metrics
            </h2>
            <p className="text-xs text-ink-3">
              Describe the friction points in your current operations and define
              measurable targets.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Detailed Problem Description{" "}
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={5}
              placeholder="Detail your current bottleneck, tools involved, manual steps performed, and what needs to be automated..."
              value={form.problemDescription}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  problemDescription: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-3 border-t border-line pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Target Success Metrics (KPI + Timeframe)
                </h3>
                <p className="text-2xs text-ink-3">
                  Measurable goals for your fractional leader
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={addMetric}
                className="border-line bg-canvas"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Metric
              </Button>
            </div>

            <div className="space-y-3">
              {form.successMetrics.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. Cycle Time Reduction"
                      value={m.metric}
                      onChange={(e) => {
                        const updated = [...form.successMetrics];
                        updated[idx].metric = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          successMetrics: updated,
                        }));
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      placeholder="Target: 60%"
                      value={m.target}
                      onChange={(e) => {
                        const updated = [...form.successMetrics];
                        updated[idx].target = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          successMetrics: updated,
                        }));
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      placeholder="Time: 45 days"
                      value={m.timeframe}
                      onChange={(e) => {
                        const updated = [...form.successMetrics];
                        updated[idx].timeframe = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          successMetrics: updated,
                        }));
                      }}
                    />
                  </div>
                  {form.successMetrics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMetric(idx)}
                      className="text-ink-4 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Expected Timeline
              </label>
              <select
                className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-xs text-ink outline-none"
                value={form.timeline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, timeline: e.target.value }))
                }
              >
                {TIMELINE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Hours Per Week Needed
              </label>
              <Input
                type="number"
                min={5}
                max={40}
                value={form.hoursPerWeek}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    hoursPerWeek: parseInt(e.target.value) || 20,
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: COMMERCIALS & COMPLIANCE ================= */}
      {currentStep === 3 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div>
            <h2 className="text-base font-bold text-ink">
              3. Budget, Commercials & Compliance
            </h2>
            <p className="text-xs text-ink-3">
              Define your compensation structure, required stack proficiencies,
              and privacy constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-2">
                Monthly Budget Band (USD)
              </h3>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Min ($)"
                  value={form.budgetMin}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      budgetMin: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <span className="text-ink-4">to</span>
                <Input
                  type="number"
                  placeholder="Max ($)"
                  value={form.budgetMax}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      budgetMax: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-2">
                Engagement Model Preference
              </h3>
              <select
                className="bg-surface mt-1 w-full rounded-md border border-line px-3 py-2 text-xs text-ink outline-none"
                value={form.preferredModel}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredModel: e.target.value,
                  }))
                }
              >
                <option value="RETAINER">
                  Monthly Fractional Retainer (Recommended)
                </option>
                <option value="HOURLY">Hourly Advisory Sprint</option>
                <option value="FIXED">Fixed Milestone Contract</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 border-t border-line pt-5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Required Technical Frameworks & Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map((skill) => {
                const isSelected = form.requiredSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-brand-indigo/10 border-brand-indigo text-brand-indigo"
                        : "hover:border-line-hover border-line bg-canvas text-ink-3"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-canvas p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Lock className="text-brand-orange h-3.5 w-3.5" />
                <span>Mutual NDA Required Before Disclosure</span>
              </div>
              <p className="text-2xs text-ink-3">
                Strategists must accept standard Loopwise Mutual NDA before
                accessing internal workflow diagrams.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.isNdaRequired}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isNdaRequired: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-line accent-brand-indigo"
            />
          </div>
        </div>
      )}

      {/* ================= STEP 4: WORKFLOWS & PUBLISH ================= */}
      {currentStep === 4 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div>
            <h2 className="text-base font-bold text-ink">
              4. Workflow Mapping & Publish Validation
            </h2>
            <p className="text-xs text-ink-3">
              Turn your operating documentation into an AI-scored workflow map
              before publishing to matching.
            </p>
          </div>

          {/* Workflow Mapper CTA Card */}
          <div className="border-brand-orange/30 bg-brand-orange/5 flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="text-brand-orange h-4 w-4" />
                <h3 className="text-sm font-bold text-ink">
                  Signature Feature: Workflow Mapper
                </h3>
              </div>
              <p className="max-w-lg text-xs text-ink-3">
                Paste your SOP or upload your documentation. Anthropic Claude
                will extract discrete steps, calculate automatability (0-100),
                and estimate weekly hours saved.
              </p>
            </div>

            {activeBriefId ? (
              <Link href={`/client/briefs/${activeBriefId}/workflows`}>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 shadow-xs gap-1.5 font-semibold text-white">
                  <Zap className="h-4 w-4" /> Open Workflow Mapper
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => saveDraft(form)}
                className="bg-brand-orange hover:bg-brand-orange/90 font-semibold text-white"
              >
                Save & Map Workflows
              </Button>
            )}
          </div>

          {/* Validation Checklist */}
          <div className="space-y-3 rounded-xl border border-line bg-canvas p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Publishing Checklist
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-xs">
                {hasTitle ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span
                  className={hasTitle ? "font-medium text-ink" : "text-ink-3"}
                >
                  Descriptive Brief Title (minimum 5 characters)
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {hasDescription ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span
                  className={
                    hasDescription ? "font-medium text-ink" : "text-ink-3"
                  }
                >
                  Problem & Architecture Objectives specified (minimum 20
                  characters)
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {hasBudget ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span
                  className={hasBudget ? "font-medium text-ink" : "text-ink-3"}
                >
                  Valid Monthly Budget Band (${form.budgetMin?.toLocaleString()}{" "}
                  - ${form.budgetMax?.toLocaleString()})
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {hasSkills ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span
                  className={hasSkills ? "font-medium text-ink" : "text-ink-3"}
                >
                  At least 1 required technical skill / framework selected (
                  {form.requiredSkills.length} selected)
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {hasWorkflows ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span className="bg-surface h-4 w-4 rounded-full border border-line" />
                )}
                <span
                  className={
                    hasWorkflows ? "font-medium text-ink" : "text-ink-4"
                  }
                >
                  Workflow Mapping Completed (Optional, {form.workflows.length}{" "}
                  mapped)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between border-t border-line pt-6">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={saving}
              className="bg-surface gap-2 border-line"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={saving}
              className="hover:bg-brand-indigo/90 gap-2 bg-brand-indigo"
            >
              Next Step <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={saving || !isReadyToPublish}
              className="gap-2 bg-emerald-600 px-6 font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              {saving ? "Publishing..." : "Publish Brief & Start Matching"}{" "}
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
