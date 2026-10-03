import React from "react";

export const metadata = {
  title: "Terms of Service | Loopwise",
  description: "Terms of service and marketplace agreement rules for Loopwise.",
};

export default function TermsPage() {
  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="mb-6 font-display text-3xl font-bold text-ink sm:text-4xl">
          Terms of Service
        </h1>
        <div className="warm-card shadow-soft space-y-6 p-8 text-sm leading-relaxed text-ink-2 sm:p-10">
          <p className="text-xs text-ink-3">Last updated: October 2, 2026</p>
          <h2 className="font-display text-lg font-bold text-ink">
            1. Marketplace Platform Overview
          </h2>
          <p>
            Loopwise provides an infrastructure and discovery marketplace
            connecting corporate sponsors with vetted Fractional Heads of AI &
            Automation. Engagements are governed by escrow contracts that
            protect milestones until accepted by the client.
          </p>
          <h2 className="font-display text-lg font-bold text-ink">
            2. Platform Fees and Escrow Release
          </h2>
          <p>
            Loopwise charges an 8% client-side platform fee on all funded
            engagements. Funds deposited for monthly retainers or fixed
            milestones remain in escrow until the client authorizes release upon
            satisfactory receipt of agreed deliverables.
          </p>
          <h2 className="font-display text-lg font-bold text-ink">
            3. Intellectual Property Rights
          </h2>
          <p>
            Upon escrow disbursement, all work product, workflow diagrams, agent
            source code, and custom telemetry created specifically for the
            client by the strategist become the exclusive property of the client
            organization.
          </p>
          <h2 className="font-display text-lg font-bold text-ink">
            4. Confidentiality & Non-Disclosure
          </h2>
          <p>
            All parties agree to treat internal corporate SOPs, API keys, and
            workflow data as confidential information under mutual
            non-disclosure obligations.
          </p>
        </div>
      </div>
    </div>
  );
}
