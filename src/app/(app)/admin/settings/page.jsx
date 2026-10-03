import React from "react";
import { Settings, Shield, Sliders, Database, Save } from "lucide-react";

export const metadata = {
  title: "Admin System Settings | Loopwise",
  description:
    "Configure global marketplace fees, escrow release rules, and AI vetting criteria.",
};

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Platform Governance & System Settings
        </h1>
        <p className="text-xs text-ink-3">
          Configure marketplace commission tiers, escrow hold windows, and
          security parameters.
        </p>
      </div>

      <div className="space-y-6">
        {/* Marketplace Fees */}
        <div className="shadow-2xs space-y-4 rounded-xl border border-line bg-panel p-6">
          <h2 className="font-display text-base font-bold text-ink">
            Marketplace Fees & Escrow
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Default Client Fee (%)
              </label>
              <input
                type="number"
                defaultValue={5}
                className="input-base w-full font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Default Strategist Take Rate (%)
              </label>
              <input
                type="number"
                defaultValue={10}
                className="input-base w-full font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Dispute Hold Window (Days)
              </label>
              <input
                type="number"
                defaultValue={14}
                className="input-base w-full font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Auto-Release Window upon Delivery (Days)
              </label>
              <input
                type="number"
                defaultValue={7}
                className="input-base w-full font-mono"
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="shadow-2xs space-y-4 rounded-xl border border-line bg-panel p-6">
          <h2 className="font-display text-base font-bold text-ink">
            Security Policies
          </h2>
          <div className="space-y-3 text-xs">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded accent-brand-indigo"
              />
              <span className="font-medium text-ink">
                Enforce 2FA for all Strategist payout accounts
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded accent-brand-indigo"
              />
              <span className="font-medium text-ink">
                Require ID verification before first proposal submission
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded accent-brand-indigo"
              />
              <span className="font-medium text-ink">
                Automated PII scrubbing on workflow brief uploads
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="btn-primary-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Platform Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
