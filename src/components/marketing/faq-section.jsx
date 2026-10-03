"use client";

import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "vetting",
    question: "How does Loopwise vet Fractional Heads of AI & Automation?",
    answer:
      "Fewer than 3% of applicants are approved. Our vetting process includes an architecture defense before our technical committee, code and orchestration reviews in LangGraph/CrewAI, and verified enterprise case study validation with past sponsors. We verify real deployment telemetry, not slide decks.",
  },
  {
    id: "escrow",
    question: "How does enterprise escrow work?",
    answer:
      "Client retainer and milestone funds are held in secure Stripe-backed escrow accounts before work begins. Payments are only released upon explicit client sign-off on delivered milestones, tested code repositories, and telemetry benchmarks. If an engagement fails to meet agreed deliverables, funds are refunded or redirected under our guarantee.",
  },
  {
    id: "fees",
    question: "What are the platform fees for clients and strategists?",
    answer:
      "Loopwise charges a flat 8% client-side platform fee on invoice amounts, which covers workflow tooling, escrow infrastructure, and ongoing telemetry hosting. Strategists pay a 10% platform fee on disbursements. There are zero hidden subscription costs, surprise setup fees, or exclusivity penalties.",
  },
  {
    id: "timelines",
    question: "How quickly can an AI leader begin mapping our workflows?",
    answer:
      "Most enterprise matches are confirmed within 48 to 72 hours. Once matched and onboarded, your strategist typically completes the initial SOP ingestion and feasibility scoring within 5 to 7 business days, delivering an actionable architecture blueprint.",
  },
  {
    id: "security",
    question: "What happens to our proprietary company data and internal SOPs?",
    answer:
      "Loopwise does not train models on your enterprise data. All workflow mapping analyses run under zero-retention enterprise API terms. Strategists sign strict mutual Non-Disclosure Agreements (NDAs) and adhere to your internal security, VPN, and IAM policies.",
  },
  {
    id: "governance",
    question:
      "How do you prevent model hallucinations, drift, and regulatory penalties?",
    answer:
      "Every production agent deployed through Loopwise adheres to the NIST AI Risk Management Framework 1.0 and EU AI Act standards. Strategists install deterministic output verification boundaries, PII redacting proxies, human-in-the-loop fallback gates, and real-time latency/error drift monitors.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="relative bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              FAQ
            </span>
          </div>
          <h2 className="font-display text-h2 font-bold tracking-tight text-ink">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-ink-2">
            Clear, honest answers about vetting, escrow protection, and agent
            delivery.
          </p>
        </div>

        <Accordion.Root type="single" collapsible className="space-y-3.5">
          {FAQ_ITEMS.map((item) => (
            <Accordion.Item
              key={item.id}
              value={item.id}
              className="warm-card overflow-hidden transition-all data-[state=open]:border-brand-accent/40"
            >
              <Accordion.Header className="flex">
                <Accordion.Trigger className="group flex flex-1 items-center justify-between rounded-t-xl p-5 text-left text-sm font-bold text-ink transition-colors hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo sm:p-6 sm:text-base">
                  <span>{item.question}</span>
                  <ChevronDown className="ml-4 h-4 w-4 shrink-0 text-brand-accent text-ink-3 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="border-line/60 overflow-hidden border-t px-5 pb-6 pt-4 text-xs leading-relaxed text-ink-2 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down sm:px-6 sm:text-sm">
                {item.answer}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
