import React from "react";

export const metadata = {
  title: "Privacy Policy | Loopwise",
  description:
    "Privacy policy, data retention rules, and enterprise telemetry protections at Loopwise.",
};

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="mb-6 font-display text-3xl font-bold text-ink sm:text-4xl">
          Privacy Policy
        </h1>
        <div className="warm-card shadow-soft space-y-6 p-8 text-sm leading-relaxed text-ink-2 sm:p-10">
          <p className="text-xs text-ink-3">Last updated: October 2, 2026</p>
          <h2 className="font-display text-lg font-bold text-ink">
            1. Data Minimization & Zero LLM Training
          </h2>
          <p>
            Loopwise will never sell, lease, or use your corporate Standard
            Operating Procedures, workflow transcripts, or employee interviews
            to train public or proprietary machine learning models.
          </p>
          <h2 className="font-display text-lg font-bold text-ink">
            2. Enterprise Zero-Retention API Terms
          </h2>
          <p>
            All workflow decomposition algorithms executed in the Loopwise
            Workflow Mapper invoke enterprise foundation models configured with
            zero-retention logging agreements.
          </p>
          <h2 className="font-display text-lg font-bold text-ink">
            3. Information We Collect
          </h2>
          <p>
            We collect account credentials, organization identifiers, and
            telemetry metrics (e.g. agent latency and error rates) solely for
            billing, access control, and platform monitoring.
          </p>
          <h2 className="font-display text-lg font-bold text-ink">
            4. Your Data Rights
          </h2>
          <p>
            Organization owners can request complete export or deletion of all
            mapped workflows and account data at any time by contacting
            privacy@loopwise.internal.
          </p>
        </div>
      </div>
    </div>
  );
}
