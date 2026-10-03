"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Globe,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  PauseCircle,
  PlayCircle,
  Save,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function StrategistProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form Fields
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState({
    checking: false,
    available: true,
    message: "",
  });
  const [hourlyRateMin, setHourlyRateMin] = useState(150);
  const [hourlyRateMax, setHourlyRateMax] = useState(300);
  const [retainerMin, setRetainerMin] = useState(5000);
  const [retainerMax, setRetainerMax] = useState(10000);
  const [availabilityHoursPerWeek, setAvailabilityHoursPerWeek] = useState(20);
  const [preferredMinWeeks, setPreferredMinWeeks] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  const [previewAsClient, setPreviewAsClient] = useState(false);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/strategist/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.profile;
          setProfile(p);
          setHeadline(p.headline || "");
          setBio(p.bio || "");
          setLocation(p.location || "");
          setTimezone(p.timezone || "America/New_York");
          setSlug(p.slug || "");
          setHourlyRateMin(p.hourlyRateMin || 150);
          setHourlyRateMax(p.hourlyRateMax || 300);
          setRetainerMin(p.retainerMin || 5000);
          setRetainerMax(p.retainerMax || 10000);
          setAvailabilityHoursPerWeek(p.availabilityHoursPerWeek || 20);
          setPreferredMinWeeks(p.preferredMinWeeks || 4);
          setIsPaused(p.status === "SUSPENDED");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Check slug uniqueness
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus({
        checking: false,
        available: false,
        message: "Min 3 characters",
      });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSlugStatus((prev) => ({ ...prev, checking: true }));
        const res = await fetch(
          `/api/strategists/check-slug?slug=${encodeURIComponent(slug)}`
        );
        if (res.ok) {
          const json = await res.json();
          setSlugStatus({
            checking: false,
            available: json.available,
            message: json.available
              ? "URL available"
              : json.message || "Unavailable",
          });
        }
      } catch (err) {
        setSlugStatus({
          checking: false,
          available: false,
          message: "Error checking slug",
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);
      setSaveSuccess(false);

      const res = await fetch("/api/strategist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          location,
          timezone,
          slug,
          hourlyRateMin,
          hourlyRateMax,
          retainerMin,
          retainerMax,
          availabilityHoursPerWeek,
          preferredMinWeeks,
          isPaused,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setProfile(json.profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const json = await res.json();
        setErrorMsg(json.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save failed", err);
      setErrorMsg("An error occurred while saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePause = async () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    try {
      await fetch("/api/strategist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaused: nextState }),
      });
    } catch (err) {
      console.error("Failed to toggle pause state", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Loading strategist profile management...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                profile?.status === "APPROVED"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-amber-300 bg-amber-50 text-amber-800"
              }
            >
              {profile?.status === "APPROVED"
                ? "Verified Strategist"
                : profile?.status || "Draft"}
            </Badge>
            {isPaused && (
              <Badge
                variant="outline"
                className="border-red-300 bg-red-50 text-red-700"
              >
                Availability Paused
              </Badge>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            Public Profile & Commercial Settings
          </h1>
          <p className="text-xs text-ink-3">
            Manage your discoverability, client-facing positioning, rates, and
            public URL slug.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewAsClient(true)}
            className="bg-surface gap-2 border-line"
          >
            <Eye className="h-4 w-4" /> Preview as Client
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !slugStatus.available}
            className="hover:bg-brand-indigo/90 gap-2 bg-brand-indigo"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Profile updated successfully. Changes are now reflected live.
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          <XCircle className="h-4 w-4 text-red-600" />
          {errorMsg}
        </div>
      )}

      {/* Availability Pause / Resume Banner */}
      <div className="bg-surface shadow-xs flex flex-col gap-3 rounded-2xl border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isPaused
                ? "border-amber-200 bg-amber-50 text-amber-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-600"
            }`}
          >
            {isPaused ? (
              <PauseCircle className="h-5 w-5" />
            ) : (
              <PlayCircle className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">
              {isPaused
                ? "Marketplace Availability is Paused"
                : "Active & Accepting Client Intros"}
            </h3>
            <p className="text-xs text-ink-3">
              {isPaused
                ? "You are hidden from client search results. Your existing engagements remain active."
                : "Your profile is discoverable in the Loopwise directory and clients can schedule intros."}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTogglePause}
          className={
            isPaused
              ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              : "border-amber-300 text-amber-800 hover:bg-amber-50"
          }
        >
          {isPaused ? "Resume Availability" : "Pause Availability"}
        </Button>
      </div>

      {/* Public URL Slug Editor */}
      <div className="bg-surface shadow-xs space-y-4 rounded-2xl border border-line p-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
            Public Profile URL
          </h2>
          <p className="text-xs text-ink-3">
            Your unique address on the Loopwise talent network.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-xs text-ink-3">
            <span>loopwise.dev/strategists/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                )
              }
              className="bg-transparent pl-1 font-semibold text-ink outline-none"
              placeholder="alex-mercer"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {slugStatus.checking ? (
              <span className="text-ink-4">Checking availability...</span>
            ) : slugStatus.available ? (
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> {slugStatus.message}
              </span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-red-600">
                <XCircle className="h-3.5 w-3.5" /> {slugStatus.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Positioning & Bio */}
      <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
            Positioning & Bio
          </h2>
          <p className="text-xs text-ink-3">
            Keep your positioning sharp to attract high-paying enterprise
            contracts.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Professional Headline
            </label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Fractional Head of AI for Series A-C SaaS • Multi-Agent Workflows & DSPy"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Executive Bio (Markdown formatted)
            </label>
            <Textarea
              rows={6}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your technical background and fractional AI deliverables..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                Timezone
              </label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/New_York (EST)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Rates */}
      <div className="bg-surface shadow-xs space-y-6 rounded-2xl border border-line p-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
            Commercial Rates & Capacity
          </h2>
          <p className="text-xs text-ink-3">
            Adjust your hourly and monthly retainer bounds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
            <h3 className="text-xs font-semibold uppercase text-ink-2">
              Hourly Advisory ($/hr)
            </h3>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={hourlyRateMin}
                onChange={(e) =>
                  setHourlyRateMin(parseFloat(e.target.value) || 0)
                }
              />
              <span className="text-ink-4">to</span>
              <Input
                type="number"
                value={hourlyRateMax}
                onChange={(e) =>
                  setHourlyRateMax(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
            <h3 className="text-xs font-semibold uppercase text-ink-2">
              Monthly Retainer ($/mo)
            </h3>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={retainerMin}
                onChange={(e) =>
                  setRetainerMin(parseFloat(e.target.value) || 0)
                }
              />
              <span className="text-ink-4">to</span>
              <Input
                type="number"
                value={retainerMax}
                onChange={(e) =>
                  setRetainerMax(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Weekly Availability (Hours/Week)
            </label>
            <Input
              type="number"
              value={availabilityHoursPerWeek}
              onChange={(e) =>
                setAvailabilityHoursPerWeek(parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Preferred Minimum Engagement (Weeks)
            </label>
            <Input
              type="number"
              value={preferredMinWeeks}
              onChange={(e) =>
                setPreferredMinWeeks(parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </div>

      {/* ================= PREVIEW AS CLIENT MODAL ================= */}
      {previewAsClient && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface max-h-[90vh] w-full max-w-3xl space-y-6 overflow-y-auto rounded-2xl border border-line p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-brand-indigo/30 bg-brand-indigo/5 text-brand-indigo"
                >
                  Client View Preview
                </Badge>
                <span className="text-2xs text-ink-3">
                  How clients see your profile
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreviewAsClient(false)}
              >
                Close Preview
              </Button>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="border-brand-indigo/20 bg-brand-indigo/10 flex h-16 w-16 items-center justify-center rounded-2xl border text-xl font-bold text-brand-indigo">
                  {profile?.user?.name?.[0] || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-ink">
                      {profile?.user?.name}
                    </h2>
                    <Badge className="border border-emerald-300 bg-emerald-50 text-2xs text-emerald-700">
                      Verified Top 3%
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-ink-3">
                    {headline}
                  </p>
                  <p className="text-ink-4 mt-1 text-2xs">
                    {location} • {timezone} • {availabilityHoursPerWeek}h/wk
                    available
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-canvas p-3 text-right">
                <div className="text-xs text-ink-3">Retainer</div>
                <div className="text-sm font-bold text-ink">
                  ${retainerMin?.toLocaleString()} - $
                  {retainerMax?.toLocaleString()}/mo
                </div>
                <div className="text-ink-4 mt-1 text-2xs">
                  ${hourlyRateMin}-${hourlyRateMax}/hr advisory
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="whitespace-pre-line rounded-xl border border-line bg-canvas p-4 text-xs leading-relaxed text-ink-2">
              {bio}
            </div>

            {/* Case Studies Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Verified Production Case Studies
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {profile?.caseStudies?.map((cs, i) => (
                  <div
                    key={i}
                    className="space-y-2 rounded-xl border border-line bg-canvas p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">
                        {cs.title}
                      </span>
                      <Badge className="border border-emerald-300 bg-emerald-50 text-2xs text-emerald-700">
                        {cs.outcomeNumber} {cs.outcomeUnit}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-2xs text-ink-3">
                      {cs.problem}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setPreviewAsClient(false)}
                className="hover:bg-brand-indigo/90 bg-brand-indigo"
              >
                Done Previewing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
