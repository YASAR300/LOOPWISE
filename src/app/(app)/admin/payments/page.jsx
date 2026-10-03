"use client";

import React, { useState } from "react";
import { CreditCard, DollarSign } from "lucide-react";
import { FilterRow } from "@/components/ui/filter-row";
import { GroupedSection } from "@/components/ui/grouped-section";
import { DataTable } from "@/components/ui/data-table";

export default function AdminPaymentsPage() {
  const [payments] = useState([
    {
      id: "pay-1",
      name: "Apex Logistics (Monthly Retainer)",
      description:
        "$8,500 escrow funded via Stripe ACH • 15% platform fee ($1,275) realized",
      date: "Oct 1, 2026",
      tools: ["Slack"],
      status: "complete",
    },
    {
      id: "pay-2",
      name: "CloudScale Inbound Routing Milestone 1",
      description: "$4,500 escrow funded via Visa ending in 4242",
      date: "Sept 28, 2026",
      tools: ["HubSpot"],
      status: "complete",
    },
  ]);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState("comfortable");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 text-brand-indigo">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Payments & Escrow Reconciliation
            </h1>
            <p className="text-xs text-ink-3">
              Platform fee accounting, payouts, and automated escrow balance
            </p>
          </div>
        </div>
      </div>

      <FilterRow
        search={search}
        onSearchChange={setSearch}
        density={density}
        onDensityChange={setDensity}
        placeholder="Filter transactions..."
      />

      <GroupedSection title="Settled Transactions" count={payments.length}>
        <DataTable data={payments} density={density} />
      </GroupedSection>
    </div>
  );
}
