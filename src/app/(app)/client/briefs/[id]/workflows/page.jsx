"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  ArrowLeft,
  FileText,
  Upload,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Shield,
  Download,
  Check,
  Edit2,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Sliders,
  DollarSign,
  Maximize2,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip as RechartsTooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LogoLoader } from "@/components/ui/logo-loader";

const SAMPLE_SOPS = {
  support: `SOP: Customer Support Escalation and Tier-1 Triage
Trigger: Customer submits ticket via Zendesk or email to support@company.com (approx 3,500 tickets/month).
Current Workflow:
1. Support agent opens Zendesk queue, manually inspects the subject line and customer domain.
2. Agent copies customer email, queries Salesforce CRM to verify subscription tier (Enterprise vs. Pro).
3. If Enterprise, agent checks PostgreSQL database via internal admin tool to pull customer account health and active contract status.
4. Agent determines if inquiry is billing, technical bug, or feature request.
5. If technical bug, agent attempts to reproduce in staging, captures logs, and manually drafts Jira issue.
6. Agent writes email response to customer in Gmail/Zendesk, sends notification into #enterprise-support Slack channel.
Pain Points:
- 18 minutes average handling time per ticket.
- High error rate during manual CRM lookup and copy-pasting customer IDs.
- Delayed notification for high-priority outages during off-hours.`,

  sales: `SOP: Inbound Sales Lead Enrichment and Routing
Trigger: Enterprise prospect fills out "Book a Demo" form on marketing site (800 leads/month).
Current Workflow:
1. Form submission posts to HubSpot CRM.
2. SDR manually researches company on LinkedIn, Crunchbase, and GitHub to determine employee count and funding round.
3. SDR assesses technical fit based on technologies listed in job postings.
4. SDR drafts customized email sequence with relevant case studies and tags Account Executive.
5. SDR creates calendar invite link via Calendly and updates HubSpot lead status.
Pain Points:
- 4 hours turnaround before first touch.
- 30% of SDR time spent on repetitive web searches and manual data entry.`,

  finance: `SOP: Vendor Invoice Extraction and Reconciliation
Trigger: Accounts payable receives vendor PDF invoice via ap@company.com (450 invoices/month).
Current Workflow:
1. Finance coordinator downloads PDF invoice from Gmail.
2. Coordinator manually extracts vendor name, PO number, line items, and tax total into Excel sheet.
3. Coordinator logs into NetSuite ERP and matches invoice against approved Purchase Order.
4. If line item discrepancy > $50, coordinator emails department manager for manual variance sign-off.
5. Once verified, invoice is scheduled for payment in Bill.com.
Pain Points:
- Takes 4 business days to approve invoices.
- Data entry typos lead to duplicate payments and audit reconciliation headaches.`,
};

export default function WorkflowMapperPage({ params }) {
  const unwrappedParams = use(params);
  const briefId = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [brief, setBrief] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [quota, setQuota] = useState({ quota: 50, used: 0, remaining: 50 });
  const [errorMsg, setErrorMsg] = useState(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Intake State
  const [intakeTab, setIntakeTab] = useState("paste"); // "paste" | "upload" | "guided"
  const [sopText, setSopText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // Guided form state
  const [guidedTrigger, setGuidedTrigger] = useState("");
  const [guidedOperator, setGuidedOperator] = useState("");
  const [guidedTools, setGuidedTools] = useState("");
  const [guidedDuration, setGuidedDuration] = useState("");
  const [guidedRuns, setGuidedRuns] = useState("");
  const [guidedFailures, setGuidedFailures] = useState("");

  // Step editing state
  const [editingStepId, setEditingStepId] = useState(null);
  const [newStepModal, setNewStepModal] = useState(false);
  const [newStepData, setNewStepData] = useState({
    name: "",
    tool: "",
    actor: "HUMAN",
    durationMinutes: 15,
    automatabilityPct: 70,
    hoursSavedWeekly: 2,
    riskLevel: "LOW",
    agentFit: "LLM_AGENT",
  });

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/client/briefs/${briefId}/workflows`);
      if (res.ok) {
        const json = await res.json();
        setBrief(json.brief);
        setWorkflows(json.workflows || []);
        setQuota(json.quota || { quota: 50, used: 0, remaining: 50 });
        if (json.workflows?.length && !selectedWorkflowId) {
          setSelectedWorkflowId(json.workflows[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load workflows", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [briefId]);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setErrorMsg(null);
      setIsConfigError(false);

      let bodyData;
      let headers = {};

      if (intakeTab === "upload" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("intakeMode", "upload");
        bodyData = formData;
      } else if (intakeTab === "guided") {
        bodyData = JSON.stringify({
          intakeMode: "guided",
          trigger: guidedTrigger,
          operator: guidedOperator,
          tools: guidedTools,
          duration: guidedDuration,
          runsPerWeek: guidedRuns,
          failureModes: guidedFailures,
        });
        headers["Content-Type"] = "application/json";
      } else {
        // Paste text
        bodyData = JSON.stringify({
          intakeMode: "paste",
          rawContent: sopText,
        });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(
        `/api/client/briefs/${briefId}/workflows/analyze`,
        {
          method: "POST",
          headers,
          body: bodyData,
        }
      );

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to analyze workflow");
        setIsConfigError(Boolean(json.isConfigError));
        return;
      }

      // Success
      await fetchWorkflows();
      if (json.workflows?.length) {
        setSelectedWorkflowId(json.workflows[0].id);
      }
      setSopText("");
      setUploadedFile(null);
    } catch (err) {
      console.error("Analysis execution failed", err);
      setErrorMsg("An error occurred during workflow analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySuggestions = async () => {
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/workflows/apply-to-brief`,
        {
          method: "POST",
        }
      );
      if (res.ok) {
        setAppliedSuccess(true);
        setTimeout(() => setAppliedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Apply error", err);
    }
  };

  const handleStepUpdate = async (workflowId, stepId, updates) => {
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/workflows/${workflowId}/steps`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepId, ...updates }),
        }
      );
      if (res.ok) {
        fetchWorkflows();
        setEditingStepId(null);
      }
    } catch (err) {
      console.error("Step update failed", err);
    }
  };

  const handleStepDelete = async (workflowId, stepId) => {
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/workflows/${workflowId}/steps?stepId=${stepId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchWorkflows();
      }
    } catch (err) {
      console.error("Step delete failed", err);
    }
  };

  const handleStepReorder = async (workflowId, stepIdx, direction) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf || !wf.steps) return;

    const targetIdx = stepIdx + direction;
    if (targetIdx < 0 || targetIdx >= wf.steps.length) return;

    const stepsCopy = [...wf.steps];
    const temp = stepsCopy[stepIdx];
    stepsCopy[stepIdx] = stepsCopy[targetIdx];
    stepsCopy[targetIdx] = temp;

    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/workflows/${workflowId}/steps`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reorder: true,
            steps: stepsCopy,
          }),
        }
      );
      if (res.ok) {
        fetchWorkflows();
      }
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

  const handleAddStep = async (workflowId) => {
    try {
      const res = await fetch(
        `/api/client/briefs/${briefId}/workflows/${workflowId}/steps`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStepData),
        }
      );
      if (res.ok) {
        setNewStepModal(false);
        setNewStepData({
          name: "",
          tool: "",
          actor: "HUMAN",
          durationMinutes: 15,
          automatabilityPct: 70,
          hoursSavedWeekly: 2,
          riskLevel: "LOW",
          agentFit: "LLM_AGENT",
        });
        fetchWorkflows();
      }
    } catch (err) {
      console.error("Add step failed", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Loading AI workflow mapper workspace...
        </p>
      </div>
    );
  }

  const selectedWorkflow =
    workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  const summary = brief?.opportunitySummary;

  // Prepare scatter chart data for 2x2 Impact vs Effort Matrix
  // X = Effort (inverted from Automatability: 100 - automatabilityScore)
  // Y = Business Impact (businessImpactHours)
  const matrixData = workflows.map((wf) => ({
    id: wf.id,
    name: wf.name,
    effort: Math.max(10, 100 - (wf.automatabilityScore || 50)),
    impact: wf.businessImpactHours || 5,
    automatability: wf.automatabilityScore || 50,
    agentFit: wf.agentFit,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/client/briefs/${briefId}/edit`}
              className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-ink-3 hover:text-ink"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Brief Builder
            </Link>
            <span className="text-ink-4">•</span>
            <Badge
              variant="outline"
              className="border-brand-orange/30 bg-brand-orange/5 text-brand-orange text-2xs font-bold"
            >
              AI Signature Feature
            </Badge>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            Workflow Mapper & Automation Scoring
          </h1>
          <p className="text-xs text-ink-3">
            Brief:{" "}
            <span className="font-semibold text-ink">
              {brief?.title || "Untitled Brief"}
            </span>
          </p>
        </div>

        {/* Quota & Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface shadow-xs flex items-center gap-2 rounded-xl border border-line px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-brand-indigo" />
            <span className="font-semibold text-ink">
              Monthly Quota: {quota.used} / {quota.quota} used
            </span>
          </div>

          <a
            href={`/api/client/briefs/${briefId}/workflows/export`}
            download
            className="bg-surface shadow-xs inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
          >
            <Download className="h-3.5 w-3.5" /> Export Markdown
          </a>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMsg && (
        <div className="shadow-xs space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          {isConfigError && (
            <div className="pl-6 text-2xs font-normal text-red-700">
              To enable the AI Workflow Mapper, add{" "}
              <code className="rounded bg-red-100 px-1 py-0.5 font-mono">
                ANTHROPIC_API_KEY=your_key
              </code>{" "}
              in your{" "}
              <code className="rounded bg-red-100 px-1 py-0.5 font-mono">
                .env.local
              </code>{" "}
              file and restart the development server.
            </div>
          )}
        </div>
      )}

      {/* ================= 1. INTAKE SECTION ================= */}
      <div className="bg-surface shadow-xs space-y-5 rounded-2xl border border-line p-6">
        <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              1. Process Documentation Intake
            </h2>
            <p className="text-xs text-ink-3">
              Paste standard operating procedures, upload workflow documents, or
              answer guided interview questions.
            </p>
          </div>

          {/* Intake mode selector tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-line bg-canvas p-1">
            <button
              type="button"
              onClick={() => setIntakeTab("paste")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                intakeTab === "paste"
                  ? "bg-surface shadow-xs text-ink"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              Paste SOP Text
            </button>
            <button
              type="button"
              onClick={() => setIntakeTab("upload")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                intakeTab === "upload"
                  ? "bg-surface shadow-xs text-ink"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              Upload File (.pdf/.docx/.md)
            </button>
            <button
              type="button"
              onClick={() => setIntakeTab("guided")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                intakeTab === "guided"
                  ? "bg-surface shadow-xs text-ink"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              Guided Interview
            </button>
          </div>
        </div>

        {/* Tab 1: Paste SOP */}
        {intakeTab === "paste" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-2xs text-ink-3">
              <span>
                Paste internal runbooks, Slack logs, or step-by-step procedures:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-ink-4 font-semibold">Try Sample:</span>
                <button
                  type="button"
                  onClick={() => setSopText(SAMPLE_SOPS.support)}
                  className="font-medium text-brand-indigo hover:underline"
                >
                  Customer Support
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSopText(SAMPLE_SOPS.sales)}
                  className="font-medium text-brand-indigo hover:underline"
                >
                  Sales Ops
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSopText(SAMPLE_SOPS.finance)}
                  className="font-medium text-brand-indigo hover:underline"
                >
                  Finance AP
                </button>
              </div>
            </div>

            <Textarea
              rows={7}
              placeholder="Paste raw operating documentation here..."
              value={sopText}
              onChange={(e) => setSopText(e.target.value)}
              className="font-mono text-xs leading-relaxed"
            />
          </div>
        )}

        {/* Tab 2: Upload File */}
        {intakeTab === "upload" && (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-canvas p-8 text-center transition-colors hover:border-brand-indigo">
              <Upload className="text-ink-4 h-8 w-8" />
              <span className="mt-2 text-xs font-bold text-ink">
                {uploadedFile
                  ? uploadedFile.name
                  : "Click or drag document to upload"}
              </span>
              <span className="text-ink-4 mt-1 text-2xs">
                Supported formats: .pdf, .docx, .txt, .md (Server-side text
                extraction)
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Tab 3: Guided Form */}
        {intakeTab === "guided" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                1. What triggers this process?
              </label>
              <Input
                placeholder="e.g. Inbound support ticket or customer contract sign-off"
                value={guidedTrigger}
                onChange={(e) => setGuidedTrigger(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                2. Who currently performs it?
              </label>
              <Input
                placeholder="e.g. Tier-1 Support Reps, Sales Operations, Accounts Payable"
                value={guidedOperator}
                onChange={(e) => setGuidedOperator(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                3. Which software & tools are involved?
              </label>
              <Input
                placeholder="e.g. Zendesk, Salesforce CRM, PostgreSQL, Slack, Gmail"
                value={guidedTools}
                onChange={(e) => setGuidedTools(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                4. Average duration per execution
              </label>
              <Input
                placeholder="e.g. 15-20 minutes per ticket"
                value={guidedDuration}
                onChange={(e) => setGuidedDuration(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                5. How many runs per week?
              </label>
              <Input
                placeholder="e.g. 800 executions per week"
                value={guidedRuns}
                onChange={(e) => setGuidedRuns(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                6. What goes wrong or requires human judgment?
              </label>
              <Input
                placeholder="e.g. Missing customer IDs, policy exceptions, staging environment timeouts"
                value={guidedFailures}
                onChange={(e) => setGuidedFailures(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="hover:bg-brand-indigo/90 gap-2 bg-brand-indigo px-6 font-semibold text-white shadow-sm"
          >
            {analyzing ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" /> Analyzing with
                Anthropic Claude...
              </>
            ) : (
              <>
                <Zap className="text-brand-orange h-4 w-4" /> Run AI Workflow
                Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ================= 2. AUTOMATION OPPORTUNITY SUMMARY ================= */}
      {summary && (
        <div className="border-brand-indigo/20 bg-brand-indigo/5 shadow-xs space-y-4 rounded-2xl border p-6">
          <div className="border-brand-indigo/10 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-base font-bold text-ink">
                Automation Opportunity Summary
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleApplySuggestions}
                className="hover:bg-brand-indigo/90 gap-1.5 bg-brand-indigo font-semibold text-white"
              >
                {appliedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" /> Applied
                    to Brief!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Apply Suggestions
                    to Brief
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="bg-surface space-y-1 rounded-xl border border-line p-4">
              <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
                Est. Hours Saved
              </span>
              <div className="text-2xl font-bold text-emerald-600">
                {summary.totalHoursSavedWeekly} hrs/wk
              </div>
              <p className="text-2xs text-ink-3">Across operational team</p>
            </div>

            <div className="bg-surface space-y-1 rounded-xl border border-line p-4">
              <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
                Avg. Automatability
              </span>
              <div className="text-2xl font-bold text-brand-indigo">
                {summary.averageAutomatability}%
              </div>
              <p className="text-2xs text-ink-3">
                Feasible automation potential
              </p>
            </div>

            <div className="bg-surface space-y-1 rounded-xl border border-line p-4">
              <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
                Recommended Strategy
              </span>
              <div className="line-clamp-2 text-sm font-bold text-ink">
                {summary.recommendedAgentArchitecture}
              </div>
              <p className="text-2xs text-ink-3">Topology recommendation</p>
            </div>

            <div className="bg-surface space-y-1 rounded-xl border border-line p-4">
              <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
                Suggested Bandwidth
              </span>
              <div className="text-brand-orange text-2xl font-bold">
                {summary.suggestedWeeklyHours} hrs/wk
              </div>
              <p className="text-2xs text-ink-3">Fractional Head of AI</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. PRIORITIZED OPPORTUNITY TABLE & 2X2 MATRIX ================= */}
      {workflows.length > 0 && (
        <div className="space-y-6">
          {/* 2x2 Impact vs Effort Matrix */}
          <div className="bg-surface shadow-xs space-y-4 rounded-2xl border border-line p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                  2x2 Opportunity Matrix: Impact vs. Complexity
                </h3>
                <p className="text-xs text-ink-3">
                  Click any data point to focus the workflow breakdown below.
                  High Impact + Low Complexity = Quick Wins.
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
                >
                  <XAxis
                    type="number"
                    dataKey="effort"
                    name="Implementation Complexity"
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "Complexity / Friction (%)",
                      position: "insideBottom",
                      offset: -10,
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="impact"
                    name="Weekly Hours Saved"
                    unit=" hrs"
                    domain={[0, "auto"]}
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "Impact (Hours/Wk)",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 11,
                    }}
                  />
                  <ZAxis range={[120, 240]} />
                  <ReferenceLine
                    x={50}
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                  />
                  <RechartsTooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-surface space-y-1 rounded-xl border border-line p-3 text-xs shadow-lg">
                          <p className="font-bold text-ink">{d.name}</p>
                          <p className="text-2xs font-semibold text-emerald-600">
                            Impact: {d.impact} hours/week saved
                          </p>
                          <p className="text-2xs font-semibold text-brand-indigo">
                            Automatability: {d.automatability}%
                          </p>
                          <p className="text-2xs text-ink-3">
                            Fit: {d.agentFit}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    data={matrixData}
                    onClick={(d) => setSelectedWorkflowId(d.id)}
                    className="cursor-pointer"
                  >
                    {matrixData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.id === selectedWorkflowId
                            ? "#f97316"
                            : "#6366f1"
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Opportunity Table */}
          <div className="bg-surface shadow-xs space-y-2 overflow-hidden rounded-2xl border border-line">
            <div className="border-b border-line p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                Prioritized Automation Opportunities ({workflows.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-canvas font-semibold uppercase tracking-wider text-ink-3">
                  <tr>
                    <th className="px-5 py-3">Workflow Name</th>
                    <th className="px-5 py-3">Automatability</th>
                    <th className="px-5 py-3">Weekly Impact</th>
                    <th className="px-5 py-3">Risk Assessment</th>
                    <th className="px-5 py-3">Agent Fit</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {workflows.map((wf) => {
                    const isSelected = wf.id === selectedWorkflowId;
                    return (
                      <tr
                        key={wf.id}
                        onClick={() => setSelectedWorkflowId(wf.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-brand-indigo/5"
                            : "hover:bg-canvas/60"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-ink">{wf.name}</div>
                          <div className="line-clamp-1 text-2xs text-ink-3">
                            {wf.description}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant="outline"
                            className="border-brand-indigo/30 font-bold text-brand-indigo"
                          >
                            {wf.automatabilityScore}%
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-600">
                          +{wf.businessImpactHours} hrs/wk
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-2xs text-ink-3">
                            {wf.riskSummary?.slice(0, 30)}...
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge className="border border-line bg-canvas text-2xs text-ink-2">
                            {wf.agentFit?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-brand-indigo"
                          >
                            Inspect Steps{" "}
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. WORKFLOW DETAIL & EDITABLE STEPS PANEL ================= */}
      {selectedWorkflow && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6">
          <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-brand-indigo/30 bg-brand-indigo/5 text-2xs font-bold text-brand-indigo"
                >
                  Selected Workflow
                </Badge>
                <span className="text-ink-4 text-2xs">
                  ID: {selectedWorkflow.id.slice(-6)}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-ink">
                {selectedWorkflow.name}
              </h2>
              <p className="text-xs text-ink-3">
                {selectedWorkflow.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setNewStepModal(true)}
                className="hover:bg-brand-indigo/90 bg-brand-indigo"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Step
              </Button>
            </div>
          </div>

          {/* Assumptions & Risk Box */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-line bg-canvas p-4 text-xs">
              <strong className="text-ink">Stated Impact Assumptions:</strong>
              <p className="leading-relaxed text-ink-2">
                {selectedWorkflow.impactAssumptions}
              </p>
            </div>

            <div className="space-y-1 rounded-xl border border-line bg-canvas p-4 text-xs">
              <strong className="text-ink">
                Safety & Compliance Guardrails:
              </strong>
              <p className="leading-relaxed text-ink-2">
                {selectedWorkflow.riskSummary}
              </p>
            </div>
          </div>

          {/* Steps List (Editable, Reorderable) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Discrete Process Steps Breakdown (
              {selectedWorkflow.steps?.length || 0} Steps)
            </h3>

            <div className="space-y-3">
              {(selectedWorkflow.steps || []).map((step, idx) => {
                const isEditing = editingStepId === step.id;

                if (isEditing) {
                  return (
                    <div
                      key={step.id}
                      className="shadow-xs space-y-3 rounded-xl border border-brand-indigo bg-canvas p-4"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-ink-4 text-2xs">
                            Step Name
                          </label>
                          <Input
                            defaultValue={step.name}
                            id={`edit-name-${step.id}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-ink-4 text-2xs">
                            Tool Involved
                          </label>
                          <Input
                            defaultValue={step.tool}
                            id={`edit-tool-${step.id}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="space-y-1">
                          <label className="text-ink-4 text-2xs">Actor</label>
                          <select
                            defaultValue={step.actor}
                            id={`edit-actor-${step.id}`}
                            className="bg-surface w-full rounded border border-line px-2 py-1 text-xs"
                          >
                            <option value="HUMAN">HUMAN</option>
                            <option value="AGENT">AGENT</option>
                            <option value="HYBRID">HYBRID</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-ink-4 text-2xs">
                            Automatability (%)
                          </label>
                          <Input
                            type="number"
                            defaultValue={step.automatabilityPct}
                            id={`edit-auto-${step.id}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-ink-4 text-2xs">
                            Hours Saved/Wk
                          </label>
                          <Input
                            type="number"
                            defaultValue={step.hoursSavedWeekly}
                            id={`edit-hours-${step.id}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-ink-4 text-2xs">
                            Agent Fit
                          </label>
                          <select
                            defaultValue={step.agentFit}
                            id={`edit-fit-${step.id}`}
                            className="bg-surface w-full rounded border border-line px-2 py-1 text-xs"
                          >
                            <option value="RULE_BASED">RULE_BASED</option>
                            <option value="LLM_AGENT">LLM_AGENT</option>
                            <option value="HUMAN_IN_THE_LOOP">
                              HUMAN_IN_THE_LOOP
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingStepId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const nameVal = document.getElementById(
                              `edit-name-${step.id}`
                            )?.value;
                            const toolVal = document.getElementById(
                              `edit-tool-${step.id}`
                            )?.value;
                            const actorVal = document.getElementById(
                              `edit-actor-${step.id}`
                            )?.value;
                            const autoVal =
                              parseFloat(
                                document.getElementById(`edit-auto-${step.id}`)
                                  ?.value
                              ) || 0;
                            const hoursVal =
                              parseFloat(
                                document.getElementById(`edit-hours-${step.id}`)
                                  ?.value
                              ) || 0;
                            const fitVal = document.getElementById(
                              `edit-fit-${step.id}`
                            )?.value;

                            handleStepUpdate(selectedWorkflow.id, step.id, {
                              name: nameVal,
                              tool: toolVal,
                              actor: actorVal,
                              automatabilityPct: autoVal,
                              hoursSavedWeekly: hoursVal,
                              agentFit: fitVal,
                            });
                          }}
                          className="bg-brand-indigo text-white"
                        >
                          Save Step
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={step.id}
                    className="shadow-xs hover:border-line-hover flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <span className="bg-brand-indigo/10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-brand-indigo">
                        {step.stepNumber}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink">
                            {step.name}
                          </span>
                          {step.tool && (
                            <Badge
                              variant="outline"
                              className="text-2xs text-ink-3"
                            >
                              {step.tool}
                            </Badge>
                          )}
                          <Badge
                            className={`border text-2xs ${
                              step.actor === "AGENT"
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : step.actor === "HYBRID"
                                  ? "border-amber-300 bg-amber-50 text-amber-800"
                                  : "border-line bg-canvas text-ink-3"
                            }`}
                          >
                            {step.actor}
                          </Badge>
                        </div>
                        {step.description && (
                          <p className="text-2xs leading-relaxed text-ink-3">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end text-xs sm:self-center">
                      <div className="text-right">
                        <div className="font-bold text-brand-indigo">
                          {step.automatabilityPct}% auto
                        </div>
                        <div className="text-2xs font-semibold text-emerald-600">
                          +{step.hoursSavedWeekly}h/wk
                        </div>
                      </div>

                      {/* Reorder and action buttons */}
                      <div className="flex items-center gap-1 border-l border-line pl-3">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            handleStepReorder(selectedWorkflow.id, idx, -1)
                          }
                          className="text-ink-4 p-1 hover:text-ink disabled:opacity-20"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === selectedWorkflow.steps.length - 1}
                          onClick={() =>
                            handleStepReorder(selectedWorkflow.id, idx, 1)
                          }
                          className="text-ink-4 p-1 hover:text-ink disabled:opacity-20"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStepId(step.id)}
                          className="text-ink-4 ml-1 p-1 hover:text-brand-indigo"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStepDelete(selectedWorkflow.id, step.id)
                          }
                          className="text-ink-4 p-1 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {newStepModal && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface w-full max-w-lg space-y-4 rounded-2xl border border-line p-6 shadow-xl">
            <h3 className="text-base font-bold text-ink">Add Custom Step</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-2xs font-semibold uppercase text-ink-3">
                  Step Name
                </label>
                <Input
                  value={newStepData.name}
                  onChange={(e) =>
                    setNewStepData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Verify Customer Identity via Stripe API"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold uppercase text-ink-3">
                    Tool Involved
                  </label>
                  <Input
                    value={newStepData.tool}
                    onChange={(e) =>
                      setNewStepData((p) => ({ ...p, tool: e.target.value }))
                    }
                    placeholder="e.g. Slack, Salesforce"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold uppercase text-ink-3">
                    Actor
                  </label>
                  <select
                    className="w-full rounded border border-line bg-canvas px-2 py-1.5 text-xs text-ink outline-none"
                    value={newStepData.actor}
                    onChange={(e) =>
                      setNewStepData((p) => ({ ...p, actor: e.target.value }))
                    }
                  >
                    <option value="HUMAN">HUMAN</option>
                    <option value="AGENT">AGENT</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold uppercase text-ink-3">
                    Automatability (%)
                  </label>
                  <Input
                    type="number"
                    value={newStepData.automatabilityPct}
                    onChange={(e) =>
                      setNewStepData((p) => ({
                        ...p,
                        automatabilityPct: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold uppercase text-ink-3">
                    Weekly Hours Saved
                  </label>
                  <Input
                    type="number"
                    value={newStepData.hoursSavedWeekly}
                    onChange={(e) =>
                      setNewStepData((p) => ({
                        ...p,
                        hoursSavedWeekly: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNewStepModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleAddStep(selectedWorkflow.id)}
                className="bg-brand-indigo font-semibold text-white"
              >
                Create Step
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
