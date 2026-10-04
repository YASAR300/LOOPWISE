"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LogoLoader } from "@/components/ui/logo-loader";

const INDUSTRIES = [
  "B2B SaaS",
  "FinTech & Banking",
  "Healthcare & Life Sciences",
  "Logistics & Supply Chain",
  "E-Commerce & Retail",
  "LegalTech & Professional Services",
  "Insurance & InsurTech",
  "Cybersecurity",
  "Manufacturing",
];

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1,000 employees",
  "1,000+ employees",
];

const POPULAR_TOOLS = [
  "Salesforce",
  "HubSpot",
  "Zendesk",
  "Slack",
  "Jira",
  "PostgreSQL",
  "Gmail / GSuite",
  "Microsoft 365",
  "SAP",
  "Snowflake",
  "Notion",
  "Stripe",
];

const COMPLIANCE_FRAMEWORKS = [
  "SOC 2 Type II",
  "HIPAA",
  "GDPR",
  "ISO 27001",
  "ISO 42001 (AI Management)",
  "PCI-DSS",
  "None / Early Stage",
];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("B2B SaaS");
  const [size, setSize] = useState("11-50 employees");
  const [website, setWebsite] = useState("");
  const [userTitle, setUserTitle] = useState("Head of Operations / Tech");
  const [toolsInUse, setToolsInUse] = useState(["Salesforce", "Slack"]);
  const [complianceNeeds, setComplianceNeeds] = useState(["SOC 2 Type II"]);

  // Billing Contact
  const [billingContactName, setBillingContactName] = useState("");
  const [billingContactEmail, setBillingContactEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // Team Invites
  const [teamInvites, setTeamInvites] = useState([
    { email: "", role: "MEMBER" },
  ]);

  useEffect(() => {
    async function loadClientData() {
      try {
        setLoading(true);
        const res = await fetch("/api/client/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.organization) {
            setName(data.organization.name || "");
            setIndustry(data.organization.industry || "B2B SaaS");
            setSize(data.organization.size || "11-50 employees");
            setWebsite(data.organization.website || "");
            if (
              Array.isArray(data.organization.toolsInUse) &&
              data.organization.toolsInUse.length
            ) {
              setToolsInUse(data.organization.toolsInUse);
            }
            if (
              Array.isArray(data.organization.complianceNeeds) &&
              data.organization.complianceNeeds.length
            ) {
              setComplianceNeeds(data.organization.complianceNeeds);
            }
            setBillingContactName(data.organization.billingContactName || "");
            setBillingContactEmail(data.organization.billingContactEmail || "");
            setBillingAddress(data.organization.billingAddress || "");
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding info", err);
      } finally {
        setLoading(false);
      }
    }

    loadClientData();
  }, []);

  const toggleTool = (tool) => {
    setToolsInUse((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const toggleCompliance = (comp) => {
    setComplianceNeeds((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const addInviteRow = () => {
    setTeamInvites((prev) => [...prev, { email: "", role: "MEMBER" }]);
  };

  const updateInviteRow = (idx, field, value) => {
    setTeamInvites((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeInviteRow = (idx) => {
    setTeamInvites((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Company name is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const validInvites = teamInvites.filter(
        (inv) => inv.email && inv.email.includes("@")
      );

      const res = await fetch("/api/client/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry,
          size,
          website,
          userTitle,
          toolsInUse,
          complianceNeeds,
          billingContactName,
          billingContactEmail,
          billingAddress,
          teamInvites: validInvites,
        }),
      });

      if (res.ok) {
        // Proceed to first brief creation
        router.push("/client/briefs/new");
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to save company profile.");
      }
    } catch (err) {
      console.error("Onboarding submission failed", err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Setting up your company workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-brand-indigo/30 bg-brand-indigo/5 font-semibold text-brand-indigo"
          >
            Enterprise Demand Onboarding
          </Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          Company Profile & Automation Setup
        </h1>
        <p className="mt-1 text-xs text-ink-3">
          Tell us about your organization, software stack, and governance needs
          to configure your workflow mapper.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Company Profile */}
        <div className="bg-surface shadow-xs space-y-5 rounded-2xl border border-line p-6">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Building2 className="h-4 w-4 text-brand-indigo" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              1. Company Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Acme Health or CloudScale"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Company Website
              </label>
              <Input
                placeholder="https://acmehealth.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Industry Sector
              </label>
              <select
                className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-xs text-ink outline-none"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Company Size
              </label>
              <select
                className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-xs text-ink outline-none"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Your Role in Company
              </label>
              <Input
                placeholder="e.g. VP of Operations, CTO, Head of Product"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Stack & Compliance */}
        <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Shield className="text-brand-orange h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              2. Current Tool Stack & Compliance
            </h2>
          </div>

          <div className="space-y-3">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Tools Currently Used in Your Core Workflows
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TOOLS.map((tool) => {
                const active = toolsInUse.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleTool(tool)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-brand-indigo/10 border-brand-indigo text-brand-indigo"
                        : "hover:border-line-hover border-line bg-canvas text-ink-3"
                    }`}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-line pt-4">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Required Compliance & Data Security Guardrails
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPLIANCE_FRAMEWORKS.map((comp) => {
                const active = complianceNeeds.includes(comp);
                return (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => toggleCompliance(comp)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                        : "hover:border-line-hover border-line bg-canvas text-ink-3"
                    }`}
                  >
                    {comp}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Team Invitations */}
        <div className="bg-surface shadow-xs space-y-5 rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-indigo" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                3. Invite Team Members
              </h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addInviteRow}
              className="border-line bg-canvas"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Invite
            </Button>
          </div>

          <p className="text-xs text-ink-3">
            Collaborate with co-founders, engineering leads, or operations teams
            on workflow mapping and hiring reviews.
          </p>

          <div className="space-y-3">
            {teamInvites.map((inv, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inv.email}
                    onChange={(e) =>
                      updateInviteRow(idx, "email", e.target.value)
                    }
                  />
                </div>
                <select
                  className="rounded-md border border-line bg-canvas px-3 py-2 text-xs text-ink outline-none"
                  value={inv.role}
                  onChange={(e) => updateInviteRow(idx, "role", e.target.value)}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
                </select>
                {teamInvites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInviteRow(idx)}
                    className="text-ink-4 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Billing Contact */}
        <div className="bg-surface shadow-xs space-y-5 rounded-2xl border border-line p-6">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              4. Billing Contact (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Accounts Payable Name
              </label>
              <Input
                placeholder="e.g. Jane Doe"
                value={billingContactName}
                onChange={(e) => setBillingContactName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Invoicing Email
              </label>
              <Input
                type="email"
                placeholder="invoices@company.com"
                value={billingContactEmail}
                onChange={(e) => setBillingContactEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Billing Address
              </label>
              <Input
                placeholder="100 Market St, Suite 400, San Francisco, CA 94105"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="hover:bg-brand-indigo/90 gap-2 bg-brand-indigo px-6 font-semibold text-white shadow-sm"
          >
            {saving ? "Saving Profile..." : "Save & Create First Brief"}{" "}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
