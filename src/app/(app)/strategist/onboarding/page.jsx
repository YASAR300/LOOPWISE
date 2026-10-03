"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Compass,
  Zap,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Globe,
  Sliders,
  Sparkles,
  Info,
  Clock,
  Eye,
  Edit3,
} from "lucide-react";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LogoLoader } from "@/components/ui/logo-loader";

const STEPS = [
  { id: 1, title: "Identity", description: "Who you are" },
  { id: 2, title: "Positioning", description: "Headline & bio" },
  { id: 3, title: "Expertise", description: "Skills & levels" },
  { id: 4, title: "Case Studies", description: "Proof of work" },
  { id: 5, title: "Commercials", description: "Rates & models" },
  { id: 6, title: "Availability", description: "Working hours" },
  { id: 7, title: "Review", description: "Submit application" },
];

const AVAILABLE_SPECIALIZATIONS = [
  "Workflow Mapping & Process Optimization",
  "Autonomous Multi-Agent Architecture",
  "LLM Systems, Evaluation & Guardrails",
  "Enterprise System Integration & Tool-Calling",
  "AI Governance, Security & Compliance",
  "Voice & Conversational AI Deployments",
  "Internal Developer Platform / AI Tooling",
];

const COMMON_SKILLS = [
  { name: "LangGraph", category: "FRAMEWORK" },
  { name: "Claude / Anthropic API", category: "MODEL" },
  { name: "OpenAI GPT-4 / o-Series", category: "MODEL" },
  { name: "LlamaIndex", category: "FRAMEWORK" },
  { name: "n8n Automation", category: "PLATFORM" },
  { name: "Make / Integromat", category: "PLATFORM" },
  { name: "Python / FastAPI", category: "FRAMEWORK" },
  { name: "PostgreSQL & pgvector", category: "PLATFORM" },
  { name: "Docker & Containerization", category: "PLATFORM" },
  { name: "BPMN 2.0 Process Modeling", category: "DOMAIN" },
  { name: "SOC2 & ISO 42001 Compliance", category: "COMPLIANCE" },
  { name: "DSPy Prompt Optimization", category: "FRAMEWORK" },
];

const INDUSTRIES_LIST = [
  "B2B SaaS",
  "FinTech & Banking",
  "Healthcare & Life Sciences",
  "Logistics & Supply Chain",
  "LegalTech & Professional Services",
  "E-Commerce & Retail",
  "Insurance & InsurTech",
  "Cybersecurity",
  "Real Estate & PropTech",
];

const TIMEZONES = [
  "UTC (London / GMT)",
  "America/New_York (EST/EDT)",
  "America/Chicago (CST/CDT)",
  "America/Denver (MST/MDT)",
  "America/Los_Angeles (PST/PDT)",
  "Europe/Paris (CET/CEST)",
  "Europe/London (BST)",
  "Asia/Dubai (GST)",
  "Asia/Kolkata (IST)",
  "Asia/Singapore (SGT)",
  "Asia/Tokyo (JST)",
  "Australia/Sydney (AEST)",
];

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export default function StrategistOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [form, setForm] = useState({
    // Step 1: Identity
    name: "",
    image: "",
    location: "",
    timezone: "America/New_York (EST/EDT)",
    linkedinUrl: "",
    githubUrl: "",
    website: "",
    phone: "",

    // Step 2: Positioning
    headline: "",
    bio: "",
    yearsExperience: 7,
    industries: ["B2B SaaS"],

    // Step 3: Expertise
    specializations: ["Workflow Mapping & Process Optimization"],
    skills: [
      { name: "LangGraph", level: 5 },
      { name: "Claude / Anthropic API", level: 5 },
      { name: "Python / FastAPI", level: 4 },
      { name: "PostgreSQL & pgvector", level: 4 },
    ],
    certifications: [],

    // Step 4: Case Studies (min 2, max 6)
    caseStudies: [
      {
        id: "cs-1",
        title: "Autonomous Ticket Triaging & Resolution Pipeline",
        clientType: "Series B FinTech",
        problem:
          "Customer operations handled 14,000 monthly tickets with a 19-hour first response time and 35 FTEs burdened with manual lookups.",
        approach:
          "Mapped tier-1 support workflows, deployed LangGraph supervisor with semantic routing to internal CRM and SQL ledger, gated high-confidence actions with automated guardrails.",
        toolsUsed: ["LangGraph", "Claude", "PostgreSQL", "Slack"],
        outcomeNumber: 68,
        outcomeUnit: "% reduction in resolution time",
        proofUrl: "https://loopwise.dev/case-studies/fintech-support",
        isConfidential: false,
      },
      {
        id: "cs-2",
        title: "Underwriting Document Extraction & Cross-Validation Engine",
        clientType: "Commercial Insurance Carrier",
        problem:
          "Manual extraction of 40-page financial statements delayed policy issuance by 6 business days per policyholder.",
        approach:
          "Architected vision-based parsing agents with deterministic schema validation and multi-agent reconciliation before human underwriter sign-off.",
        toolsUsed: ["Python", "FastAPI", "Docker", "pgvector"],
        outcomeNumber: 82,
        outcomeUnit: "% faster quote turnaround",
        proofUrl: "",
        isConfidential: true,
      },
    ],

    // Step 5: Commercials
    engagementModels: ["RETAINER", "HOURLY"],
    hourlyRateMin: 200,
    hourlyRateMax: 350,
    retainerMin: 6000,
    retainerMax: 12000,
    availabilityHoursPerWeek: 20,
    preferredMinWeeks: 8,

    // Step 6: Availability
    availabilitySlots: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "13:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "13:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "13:00" },
      { dayOfWeek: 5, startTime: "10:00", endTime: "14:00" },
    ],

    // Step 7: Terms
    termsAccepted: false,
  });

  const [bioPreviewMode, setBioPreviewMode] = useState(false);
  const [customCertInput, setCustomCertInput] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Load initial draft from DB
  useEffect(() => {
    async function loadDraft() {
      try {
        setLoading(true);
        const res = await fetch("/api/strategist/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.onboardingStep) {
            setCurrentStep(data.onboardingStep);
          }
          if (data.profile) {
            setForm((prev) => ({
              ...prev,
              name: data.profile.user?.name || prev.name,
              image: data.profile.user?.image || prev.image,
              location: data.profile.location || prev.location,
              timezone: data.profile.timezone || prev.timezone,
              linkedinUrl: data.profile.linkedinUrl || prev.linkedinUrl,
              githubUrl: data.profile.githubUrl || prev.githubUrl,
              website: data.profile.website || prev.website,
              phone: data.profile.phone || prev.phone,
              headline: data.profile.headline || prev.headline,
              bio: data.profile.bio || prev.bio,
              yearsExperience:
                data.profile.yearsExperience || prev.yearsExperience,
              industries: data.profile.industries || prev.industries,
              specializations:
                data.profile.specializations?.map(
                  (s) => s.specialization.name
                ) || prev.specializations,
              skills:
                data.profile.skills?.map((s) => ({
                  name: s.skill.name,
                  level: s.level,
                })) || prev.skills,
              certifications:
                data.profile.certifications || prev.certifications,
              caseStudies:
                data.profile.caseStudies && data.profile.caseStudies.length > 0
                  ? data.profile.caseStudies.map((cs) => ({
                      id: cs.id,
                      title: cs.title || "",
                      clientType: cs.clientType || "",
                      problem: cs.problem || "",
                      approach: cs.approach || "",
                      toolsUsed: cs.toolsUsed || [],
                      outcomeNumber: cs.outcomeNumber || 0,
                      outcomeUnit: cs.outcomeUnit || "",
                      proofUrl: cs.proofUrl || "",
                      isConfidential: Boolean(cs.isConfidential),
                    }))
                  : prev.caseStudies,
              engagementModels:
                data.profile.engagementModels || prev.engagementModels,
              hourlyRateMin: data.profile.hourlyRateMin || prev.hourlyRateMin,
              hourlyRateMax: data.profile.hourlyRateMax || prev.hourlyRateMax,
              retainerMin: data.profile.retainerMin || prev.retainerMin,
              retainerMax: data.profile.retainerMax || prev.retainerMax,
              availabilityHoursPerWeek:
                data.profile.availabilityHoursPerWeek ||
                prev.availabilityHoursPerWeek,
              preferredMinWeeks:
                data.profile.preferredMinWeeks || prev.preferredMinWeeks,
              availabilitySlots:
                data.profile.availabilitySlots &&
                data.profile.availabilitySlots.length > 0
                  ? data.profile.availabilitySlots.map((s) => ({
                      dayOfWeek: s.dayOfWeek,
                      startTime: s.startTime,
                      endTime: s.endTime,
                    }))
                  : prev.availabilitySlots,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding state", err);
      } finally {
        setLoading(false);
      }
    }
    loadDraft();
  }, []);

  // Autosave handler
  const saveCurrentStep = useCallback(async (stepToSave, currentFormData) => {
    try {
      setSaving(true);
      setErrorMsg(null);
      let payload = {};

      if (stepToSave === 1) {
        payload = {
          name: currentFormData.name,
          image: currentFormData.image,
          location: currentFormData.location,
          timezone: currentFormData.timezone,
          linkedinUrl: currentFormData.linkedinUrl,
          githubUrl: currentFormData.githubUrl,
          website: currentFormData.website,
          phone: currentFormData.phone,
        };
      } else if (stepToSave === 2) {
        payload = {
          headline: currentFormData.headline,
          bio: currentFormData.bio,
          yearsExperience: Number(currentFormData.yearsExperience),
          industries: currentFormData.industries,
        };
      } else if (stepToSave === 3) {
        payload = {
          specializations: currentFormData.specializations,
          skills: currentFormData.skills,
          certifications: currentFormData.certifications,
        };
      } else if (stepToSave === 4) {
        payload = {
          caseStudies: currentFormData.caseStudies,
        };
      } else if (stepToSave === 5) {
        payload = {
          engagementModels: currentFormData.engagementModels,
          hourlyRateMin: Number(currentFormData.hourlyRateMin),
          hourlyRateMax: Number(currentFormData.hourlyRateMax),
          retainerMin: Number(currentFormData.retainerMin),
          retainerMax: Number(currentFormData.retainerMax),
          availabilityHoursPerWeek: Number(
            currentFormData.availabilityHoursPerWeek
          ),
          preferredMinWeeks: Number(currentFormData.preferredMinWeeks),
        };
      } else if (stepToSave === 6) {
        payload = {
          availabilitySlots: currentFormData.availabilitySlots,
        };
      }

      const res = await fetch("/api/strategist/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: stepToSave,
          data: payload,
        }),
      });

      if (res.ok) {
        setLastSaved(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to autosave step");
      }
    } catch (err) {
      console.error("Autosave error", err);
    } finally {
      setSaving(false);
    }
  }, []);

  // Keyboard navigation: Ctrl/Cmd + Enter to proceed
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleNext = async () => {
    if (currentStep < 7) {
      await saveCurrentStep(currentStep, form);
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

  // Submit complete application
  const handleSubmitApplication = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);

      // Verify terms
      if (!form.termsAccepted) {
        setErrorMsg(
          "Please accept the Loopwise Vetting terms and Code of Conduct before submitting."
        );
        setSaving(false);
        return;
      }

      const res = await fetch("/api/strategist/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to submit application");
        setSaving(false);
        return;
      }

      // Successful submission -> take them to the assessment!
      router.push("/strategist/assessment");
    } catch (err) {
      console.error("Submission failed", err);
      setErrorMsg("An unexpected error occurred during submission.");
      setSaving(false);
    }
  };

  // Helper mutations
  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpecialization = (name) => {
    setForm((prev) => {
      const exists = prev.specializations.includes(name);
      return {
        ...prev,
        specializations: exists
          ? prev.specializations.filter((s) => s !== name)
          : [...prev.specializations, name],
      };
    });
  };

  const toggleIndustry = (name) => {
    setForm((prev) => {
      const exists = prev.industries.includes(name);
      return {
        ...prev,
        industries: exists
          ? prev.industries.filter((i) => i !== name)
          : [...prev.industries, name],
      };
    });
  };

  const toggleEngagementModel = (model) => {
    setForm((prev) => {
      const exists = prev.engagementModels.includes(model);
      return {
        ...prev,
        engagementModels: exists
          ? prev.engagementModels.filter((m) => m !== model)
          : [...prev.engagementModels, model],
      };
    });
  };

  const setSkillLevel = (name, level) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.name === name ? { ...s, level } : s)),
    }));
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const trimmed = customSkillInput.trim();
    if (
      !form.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setForm((prev) => ({
        ...prev,
        skills: [...prev.skills, { name: trimmed, level: 4 }],
      }));
    }
    setCustomSkillInput("");
  };

  const removeSkill = (name) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== name),
    }));
  };

  const addCaseStudy = () => {
    if (form.caseStudies.length >= 6) return;
    setForm((prev) => ({
      ...prev,
      caseStudies: [
        ...prev.caseStudies,
        {
          id: `cs-${Date.now()}`,
          title: "",
          clientType: "",
          problem: "",
          approach: "",
          toolsUsed: [],
          outcomeNumber: 0,
          outcomeUnit: "",
          proofUrl: "",
          isConfidential: false,
        },
      ],
    }));
  };

  const updateCaseStudy = (index, key, val) => {
    setForm((prev) => {
      const updated = [...prev.caseStudies];
      updated[index] = { ...updated[index], [key]: val };
      return { ...prev, caseStudies: updated };
    });
  };

  const removeCaseStudy = (index) => {
    if (form.caseStudies.length <= 2) {
      alert("A minimum of 2 verified case studies are required.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.filter((_, i) => i !== index),
    }));
  };

  const addAvailabilitySlot = () => {
    setForm((prev) => ({
      ...prev,
      availabilitySlots: [
        ...prev.availabilitySlots,
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      ],
    }));
  };

  const updateAvailabilitySlot = (index, key, val) => {
    setForm((prev) => {
      const updated = [...prev.availabilitySlots];
      updated[index] = { ...updated[index], [key]: val };
      return { ...prev, availabilitySlots: updated };
    });
  };

  const removeAvailabilitySlot = (index) => {
    setForm((prev) => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Loading your onboarding application...
        </p>
      </div>
    );
  }

  // Completeness calculations for Step 7
  const isIdentityComplete = Boolean(
    form.name && form.location && form.timezone && form.linkedinUrl
  );
  const isPositioningComplete = Boolean(
    form.headline && form.bio && form.industries.length > 0
  );
  const isExpertiseComplete = Boolean(
    form.specializations.length > 0 && form.skills.length >= 3
  );
  const isCaseStudiesComplete =
    form.caseStudies.length >= 2 &&
    form.caseStudies.every((c) => c.title && c.problem && c.approach);
  const isCommercialsComplete = Boolean(
    form.engagementModels.length > 0 &&
    form.hourlyRateMin &&
    form.availabilityHoursPerWeek
  );
  const isAvailabilityComplete = form.availabilitySlots.length > 0;
  const isAllReady =
    isIdentityComplete &&
    isPositioningComplete &&
    isExpertiseComplete &&
    isCaseStudiesComplete &&
    isCommercialsComplete &&
    isAvailabilityComplete;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header & Autosave status */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-brand-indigo/30 bg-brand-indigo/5 text-brand-indigo"
            >
              Fractional AI Admissions
            </Badge>
            {saving ? (
              <span className="flex items-center gap-1.5 text-xs text-ink-3">
                <span className="bg-brand-orange h-2 w-2 animate-ping rounded-full" />
                Saving draft...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Autosaved at {lastSaved}
              </span>
            ) : null}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            Strategist Application & Vetting
          </h1>
          <p className="text-sm text-ink-3">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}{" "}
            — {STEPS[currentStep - 1].description}
          </p>
        </div>

        <div className="text-ink-4 flex items-center gap-2 text-xs">
          <kbd className="shadow-xs rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-2xs text-ink-2">
            ⌘ + Enter
          </kbd>
          <span>to save & continue</span>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-surface shadow-xs rounded-xl border border-line p-4">
        <Stepper
          steps={STEPS}
          currentStep={currentStep - 1}
          className="overflow-x-auto pb-1"
        />
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {/* ================= STEP 1: IDENTITY ================= */}
      {currentStep === 1 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="border-b border-line pb-4">
            <h2 className="text-lg font-semibold text-ink">
              1. Identity & Contact Details
            </h2>
            <p className="text-xs text-ink-3">
              Your public persona visible to vetted enterprise clients hiring
              Fractional Heads of AI.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Dr. Alex Mercer"
                value={form.name}
                onChange={(e) => updateFormField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Profile Photo URL
              </label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={form.image}
                onChange={(e) => updateFormField("image", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Location (City, Country) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. San Francisco, CA or London, UK"
                value={form.location}
                onChange={(e) => updateFormField("location", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Primary Timezone <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
                value={form.timezone}
                onChange={(e) => updateFormField("timezone", e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                LinkedIn Profile URL <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="https://linkedin.com/in/alex-mercer"
                value={form.linkedinUrl}
                onChange={(e) => updateFormField("linkedinUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                GitHub or Technical Portfolio URL
              </label>
              <Input
                placeholder="https://github.com/alexmercer"
                value={form.githubUrl}
                onChange={(e) => updateFormField("githubUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Personal Website / Architecture Blog
              </label>
              <Input
                placeholder="https://alexmercer.ai"
                value={form.website}
                onChange={(e) => updateFormField("website", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Phone Number (Optional - for emergency SMS alerts)
              </label>
              <Input
                placeholder="+1 (555) 019-2834"
                value={form.phone}
                onChange={(e) => updateFormField("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: POSITIONING ================= */}
      {currentStep === 2 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="border-b border-line pb-4">
            <h2 className="text-lg font-semibold text-ink">
              2. Positioning & Background
            </h2>
            <p className="text-xs text-ink-3">
              Define your strategic niche. Top clients look for
              hyper-specialized automation leaders.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Professional Headline <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Fractional Head of AI for Series A-C SaaS • Multi-Agent Workflows & DSPy"
                value={form.headline}
                onChange={(e) => updateFormField("headline", e.target.value)}
              />
              <p className="text-ink-4 text-2xs">
                Keep it under 100 characters. Focus on your architectural
                outcome and target buyer.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Executive Bio (Markdown Supported){" "}
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setBioPreviewMode(!bioPreviewMode)}
                  className="flex items-center gap-1 text-xs font-medium text-brand-indigo hover:underline"
                >
                  {bioPreviewMode ? (
                    <>
                      <Edit3 className="h-3.5 w-3.5" /> Edit Markdown
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Preview Formatting
                    </>
                  )}
                </button>
              </div>

              {bioPreviewMode ? (
                <div className="min-h-[160px] rounded-lg border border-line bg-canvas p-4 text-sm leading-relaxed text-ink">
                  <div className="prose prose-sm max-w-none">
                    {form.bio.split("\n\n").map((para, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <Textarea
                  rows={6}
                  placeholder="Detail your engineering leadership background, typical fractional mandate duration, and agent architectures you specialize in..."
                  value={form.bio}
                  onChange={(e) => updateFormField("bio", e.target.value)}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Years of Technical & Leadership Experience
                </label>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={form.yearsExperience}
                  onChange={(e) =>
                    updateFormField("yearsExperience", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Target Industries
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {INDUSTRIES_LIST.map((ind) => {
                    const selected = form.industries.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => toggleIndustry(ind)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? "bg-brand-indigo/10 border-brand-indigo text-brand-indigo"
                            : "bg-surface hover:border-line-hover border-line text-ink-3"
                        }`}
                      >
                        {ind}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: EXPERTISE ================= */}
      {currentStep === 3 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="border-b border-line pb-4">
            <h2 className="text-lg font-semibold text-ink">
              3. Core Expertise & Skill Proficiency
            </h2>
            <p className="text-xs text-ink-3">
              Select specializations and rank your hands-on mastery on a 1-5
              scale (5 = Production Principal).
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Primary Specializations (Select all that apply)
              </label>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {AVAILABLE_SPECIALIZATIONS.map((spec) => {
                  const active = form.specializations.includes(spec);
                  return (
                    <div
                      key={spec}
                      onClick={() => toggleSpecialization(spec)}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                        active
                          ? "bg-brand-indigo/5 shadow-xs border-brand-indigo text-brand-indigo"
                          : "bg-surface hover:border-line-hover border-line text-ink-2"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          active
                            ? "border-brand-indigo bg-brand-indigo text-white"
                            : "border-line bg-white"
                        }`}
                      >
                        {active && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span className="text-xs font-medium leading-snug">
                        {spec}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills Proficiency Sliders */}
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Skills & Framework Proficiency (1 to 5)
                  </h3>
                  <p className="text-2xs text-ink-3">
                    1 = Conceptual Knowledge, 3 = Intermediate Builder, 5 =
                    Enterprise Production Architect
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add custom framework..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                    className="h-8 w-48 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={addCustomSkill}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {form.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex flex-col gap-2 rounded-xl border border-line bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center justify-between sm:w-1/3">
                      <span className="text-xs font-semibold text-ink">
                        {skill.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.name)}
                        className="text-ink-4 hover:text-red-500 sm:hidden"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-1 items-center gap-4 sm:px-4">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={skill.level}
                        onChange={(e) =>
                          setSkillLevel(skill.name, parseInt(e.target.value))
                        }
                        className="h-2 w-full cursor-pointer accent-brand-indigo"
                      />
                      <Badge
                        variant="outline"
                        className="border-brand-indigo/30 w-16 justify-center text-xs font-bold text-brand-indigo"
                      >
                        Level {skill.level}/5
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSkill(skill.name)}
                      className="text-ink-4 hidden hover:text-red-500 sm:block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick skill add chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-ink-4 text-2xs font-semibold uppercase">
                  Popular:
                </span>
                {COMMON_SKILLS.filter(
                  (cs) => !form.skills.some((s) => s.name === cs.name)
                ).map((cs) => (
                  <button
                    key={cs.name}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        skills: [...prev.skills, { name: cs.name, level: 4 }],
                      }))
                    }
                    className="bg-surface inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-2xs text-ink-3 hover:border-brand-indigo hover:text-brand-indigo"
                  >
                    <Plus className="h-2.5 w-2.5" /> {cs.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 4: CASE STUDIES ================= */}
      {currentStep === 4 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                4. Verified Case Studies (Min 2, Max 6)
              </h2>
              <p className="text-xs text-ink-3">
                Demonstrate measurable ROI and system architectures from real
                customer or internal deployments.
              </p>
            </div>
            {form.caseStudies.length < 6 && (
              <Button
                size="sm"
                onClick={addCaseStudy}
                className="hover:bg-brand-indigo/90 bg-brand-indigo"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Case Study
              </Button>
            )}
          </div>

          <div className="space-y-8">
            {form.caseStudies.map((cs, idx) => (
              <div
                key={cs.id || idx}
                className="shadow-xs relative space-y-4 rounded-xl border border-line bg-canvas p-5"
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-indigo/10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-brand-indigo">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-ink">
                      {cs.title || `Case Study #${idx + 1}`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-3">
                      <Lock className="h-3 w-3" />
                      <span>Confidential Client</span>
                      <input
                        type="checkbox"
                        checked={cs.isConfidential}
                        onChange={(e) =>
                          updateCaseStudy(
                            idx,
                            "isConfidential",
                            e.target.checked
                          )
                        }
                        className="rounded border-line accent-brand-indigo"
                      />
                    </label>

                    {form.caseStudies.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeCaseStudy(idx)}
                        className="text-ink-4 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      Case Study Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. End-to-End Underwriting Agentic Automation"
                      value={cs.title}
                      onChange={(e) =>
                        updateCaseStudy(idx, "title", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      Client Type / Segment{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Series B InsurTech or Fortune 500 Bank"
                      value={cs.clientType}
                      onChange={(e) =>
                        updateCaseStudy(idx, "clientType", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                    Problem Statement <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Describe the workflow bottlenecks, scale, and pain points before intervention..."
                    value={cs.problem}
                    onChange={(e) =>
                      updateCaseStudy(idx, "problem", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                    Architecture & Approach{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="How did you map the processes, orchestrate agents, and guarantee safety..."
                    value={cs.approach}
                    onChange={(e) =>
                      updateCaseStudy(idx, "approach", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      Measurable Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 74"
                      value={cs.outcomeNumber || ""}
                      onChange={(e) =>
                        updateCaseStudy(
                          idx,
                          "outcomeNumber",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      Metric Unit / Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. % reduction in cycle time or $400k/yr saved"
                      value={cs.outcomeUnit}
                      onChange={(e) =>
                        updateCaseStudy(idx, "outcomeUnit", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      Proof / Live Demo URL (Optional)
                    </label>
                    <Input
                      placeholder="https://loom.com/share/... or github repo"
                      value={cs.proofUrl}
                      onChange={(e) =>
                        updateCaseStudy(idx, "proofUrl", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 5: COMMERCIALS ================= */}
      {currentStep === 5 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="border-b border-line pb-4">
            <h2 className="text-lg font-semibold text-ink">
              5. Commercial Terms & Engagement Models
            </h2>
            <p className="text-xs text-ink-3">
              Transparent pricing ensures instant matchmaking with qualified
              enterprise budgets.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Accepted Engagement Models
              </label>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    id: "RETAINER",
                    title: "Monthly Fractional Retainer",
                    desc: "Dedicated 10-25 hrs/wk strategic oversight & engineering direction",
                  },
                  {
                    id: "HOURLY",
                    title: "Hourly Advisory",
                    desc: "Architecture reviews, workflow audits, and executive advisory",
                  },
                  {
                    id: "FIXED",
                    title: "Fixed-Scope Sprint",
                    desc: "2-4 week sprint mapping and deploying a specific agent topology",
                  },
                ].map((mod) => {
                  const active = form.engagementModels.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleEngagementModel(mod.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        active
                          ? "bg-brand-indigo/5 shadow-xs border-brand-indigo text-ink"
                          : "hover:border-line-hover border-line bg-canvas text-ink-3"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink">
                          {mod.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={active}
                          readOnly
                          className="rounded border-line accent-brand-indigo"
                        />
                      </div>
                      <p className="mt-1 text-2xs leading-relaxed text-ink-3">
                        {mod.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-line bg-canvas p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-2">
                  Hourly Advisory Range (USD / Hour)
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-ink-4 text-2xs">Min Rate ($)</span>
                    <Input
                      type="number"
                      value={form.hourlyRateMin}
                      onChange={(e) =>
                        updateFormField("hourlyRateMin", e.target.value)
                      }
                    />
                  </div>
                  <span className="text-ink-4 mt-4">—</span>
                  <div className="flex-1">
                    <span className="text-ink-4 text-2xs">Max Rate ($)</span>
                    <Input
                      type="number"
                      value={form.hourlyRateMax}
                      onChange={(e) =>
                        updateFormField("hourlyRateMax", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-line bg-canvas p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-2">
                  Monthly Retainer Range (USD / Month)
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-ink-4 text-2xs">Min ($)</span>
                    <Input
                      type="number"
                      value={form.retainerMin}
                      onChange={(e) =>
                        updateFormField("retainerMin", e.target.value)
                      }
                    />
                  </div>
                  <span className="text-ink-4 mt-4">—</span>
                  <div className="flex-1">
                    <span className="text-ink-4 text-2xs">Max ($)</span>
                    <Input
                      type="number"
                      value={form.retainerMax}
                      onChange={(e) =>
                        updateFormField("retainerMax", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Weekly Availability (Hours / Week)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={50}
                  value={form.availabilityHoursPerWeek}
                  onChange={(e) =>
                    updateFormField(
                      "availabilityHoursPerWeek",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <p className="text-ink-4 text-2xs">
                  Typically 10-25 hrs/wk for Fractional Heads of AI.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Preferred Minimum Engagement Length (Weeks)
                </label>
                <Input
                  type="number"
                  min={2}
                  max={52}
                  value={form.preferredMinWeeks}
                  onChange={(e) =>
                    updateFormField(
                      "preferredMinWeeks",
                      parseInt(e.target.value) || 4
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 6: AVAILABILITY ================= */}
      {currentStep === 6 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                6. Weekly Availability Calendar
              </h2>
              <p className="text-xs text-ink-3">
                Clients book 30-minute intro calls directly against your
                recurring weekly windows in {form.timezone}.
              </p>
            </div>
            <Button size="sm" onClick={addAvailabilitySlot} variant="secondary">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Recurring Window
            </Button>
          </div>

          <div className="space-y-3">
            {form.availabilitySlots.map((slot, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 sm:w-1/3">
                  <select
                    className="bg-surface rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink outline-none"
                    value={slot.dayOfWeek}
                    onChange={(e) =>
                      updateAvailabilitySlot(
                        idx,
                        "dayOfWeek",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-ink-3">
                    <span>Start:</span>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateAvailabilitySlot(idx, "startTime", e.target.value)
                      }
                      className="bg-surface rounded border border-line px-2 py-1 text-xs text-ink"
                    />
                  </div>
                  <span className="text-ink-4">to</span>
                  <div className="flex items-center gap-2 text-xs text-ink-3">
                    <span>End:</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateAvailabilitySlot(idx, "endTime", e.target.value)
                      }
                      className="bg-surface rounded border border-line px-2 py-1 text-xs text-ink"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeAvailabilitySlot(idx)}
                  className="text-ink-4 self-end hover:text-red-500 sm:self-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 7: REVIEW & SUBMIT ================= */}
      {currentStep === 7 && (
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6 md:p-8">
          <div className="border-b border-line pb-4">
            <h2 className="text-lg font-semibold text-ink">
              7. Review Completeness & Submit for Vetting
            </h2>
            <p className="text-xs text-ink-3">
              Loopwise guarantees a 48-hour SLA for technical admissions review.
              Review your submission below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                title: "1. Identity & Contact",
                complete: isIdentityComplete,
                summary: `${form.name} • ${form.location}`,
                stepTarget: 1,
              },
              {
                title: "2. Positioning & Bio",
                complete: isPositioningComplete,
                summary: `${form.headline || "No headline set"}`,
                stepTarget: 2,
              },
              {
                title: "3. Expertise & Skills",
                complete: isExpertiseComplete,
                summary: `${form.specializations.length} specializations, ${form.skills.length} skills ranked`,
                stepTarget: 3,
              },
              {
                title: "4. Case Studies",
                complete: isCaseStudiesComplete,
                summary: `${form.caseStudies.length} case studies provided (min 2 required)`,
                stepTarget: 4,
              },
              {
                title: "5. Commercials",
                complete: isCommercialsComplete,
                summary: `$${form.hourlyRateMin}-$${form.hourlyRateMax}/hr • ${form.availabilityHoursPerWeek}h/wk`,
                stepTarget: 5,
              },
              {
                title: "6. Availability Slots",
                complete: isAvailabilityComplete,
                summary: `${form.availabilitySlots.length} weekly windows in ${form.timezone}`,
                stepTarget: 6,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between rounded-xl border border-line bg-canvas p-4"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    {item.complete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <h3 className="text-xs font-bold text-ink">{item.title}</h3>
                  </div>
                  <p className="line-clamp-1 text-2xs text-ink-3">
                    {item.summary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(item.stepTarget)}
                  className="shrink-0 text-xs font-semibold text-brand-indigo hover:underline"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) =>
                  updateFormField("termsAccepted", e.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-line accent-brand-indigo"
              />
              <div className="text-xs leading-relaxed text-ink-2">
                <span className="font-semibold text-ink">
                  I accept the Loopwise Fractional Admissions Terms & Code of
                  Conduct:
                </span>{" "}
                I certify that all case studies, client metrics, and experience
                claims are factual. I agree that Loopwise Admissions may verify
                my references, conduct background validation, and benchmark my
                architecture in the timed scenario assessment.
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between border-t border-line pt-6">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={saving}
              className="bg-surface gap-2 border-line hover:bg-canvas"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep < 7 ? (
            <Button
              onClick={handleNext}
              disabled={saving}
              className="hover:bg-brand-indigo/90 gap-2 bg-brand-indigo text-white"
            >
              Save & Next Step <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitApplication}
              disabled={saving || !isAllReady || !form.termsAccepted}
              className="bg-brand-orange hover:bg-brand-orange/90 gap-2 px-6 font-semibold text-white shadow-sm"
            >
              Submit & Proceed to Assessment <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
