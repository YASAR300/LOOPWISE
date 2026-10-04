// src/lib/contract-templates.js
/**
 * Versioned standard legal clause templates for fractional AI & automation engagements.
 */

export const CONTRACT_TEMPLATE_VERSION = "2026.1";

export const IP_ASSIGNMENT_CLAUSES = {
  standard_v1: {
    version: "1.0",
    title: "Standard Work for Hire & Moral Rights Waiver",
    text: `All work product, workflow maps, software code, automations, prompt architectures, configuration scripts, custom fine-tuned weights, and system documentation developed by the Strategist specifically for the Client under this Statement of Work shall constitute "Work Made for Hire" and shall belong solely and exclusively as the property of Client upon receipt of payment.`,
  },
  open_source_permissive_v1: {
    version: "1.0",
    title: "Dual IP: Client Proprietary Logic with MIT Open Source Utilities",
    text: `Client retains exclusive ownership of proprietary enterprise workflows, database schemas, and private training datasets. Strategist retains the right to publish generic, sanitized connector boilerplate and non-confidential utility scripts under the MIT Open Source license.`,
  },
};

export const CONFIDENTIALITY_CLAUSES = {
  mutual_nd_v1: {
    version: "1.0",
    title: "Mutual Confidentiality & Non-Disclosure (Standard)",
    text: `Both parties agree to protect non-public technical, business, customer, process, security, and financial Confidential Information with the same degree of care used for their own sensitive data, but no less than reasonable care.`,
  },
  strict_enterprise_v1: {
    version: "1.0",
    title: "Strict Enterprise & SOC2 / HIPAA Confidentiality",
    text: `Strategist agrees to undergo background verification if required, execute client-specific Business Associate Agreements (BAA) for protected health information (PHI), and comply with SOC2 Type II audit controls. Zero retention of client API tokens or customer PII on personal local machines.`,
  },
};

export const TERMINATION_CLAUSES = {
  standard_notice_v1: {
    version: "1.0",
    title: "Standard Written Notice with 14-Day Fit Guarantee",
    text: `Either party may terminate this agreement for convenience by providing {{noticeDays}} calendar days written notice. Under the Loopwise 14-Day Fit Guarantee, if within the first 14 calendar days of an engagement either party determines the working relationship is not a fit, Client may initiate a replacement request through the platform for expedited transition or escrow mediation.`,
  },
};

export const CADENCE_CLAUSES = {
  weekly_rhythm_v1: {
    version: "1.0",
    title: "Weekly Operating Cadence & Asynchronous Review",
    text: `Strategist shall post weekly cadence updates via the Loopwise Workspace (Done, Next, Risks, Decisions Needed). Client commits to reviewing and acknowledging updates within 5 business days.`,
  },
};

export const STANDARD_CLAUSES = {
  ipAssignment: `### 1. Intellectual Property & Work Product Assignment
1.1 **Ownership of Deliverables**: All work product, workflow maps, software code, automations, prompt architectures, configuration scripts, custom fine-tuned weights, and system documentation developed by the Strategist specifically for the Client under this Statement of Work shall constitute "Work Made for Hire" and shall belong solely and exclusively to the Client upon receipt of payment.
1.2 **Pre-Existing IP**: The Strategist retains ownership of any pre-existing frameworks, proprietary prompt libraries, general methodology templates, or public tools developed prior to this engagement ("Strategist Background Technology"). The Strategist hereby grants the Client a perpetual, irrevocable, worldwide, royalty-free, non-exclusive license to use, modify, and integrate such Background Technology as incorporated into the Deliverables.
1.3 **Model Governance & AI Weights**: All customer proprietary data, operational records, and context embeddings generated during the engagement remain confidential and shall not be used to train any third-party or public foundational models without prior written consent.`,

  confidentiality: `### 2. Confidentiality & Non-Disclosure
2.1 **Confidential Information**: "Confidential Information" includes all non-public technical, business, customer, process, security, and financial information disclosed by either party directly or indirectly.
2.2 **Standard of Care**: The receiving party agrees to protect the Confidential Information with the same degree of care it uses for its own sensitive data, but no less than reasonable care.
2.3 **Exclusions**: Confidential Information does not include information that is publicly known through no breach, already known to the receiving party prior to disclosure, or independently developed without reference to the disclosing party's information.
2.4 **Data Security & Privacy**: The Strategist agrees to comply with applicable data protection regulations (including GDPR, CCPA, and SOC2 guidelines) when interfacing with Client production systems, API credentials, or private databases.`,

  termination: `### 3. Term, Notice Period & Termination
3.1 **Term**: This Agreement commences on the specified Start Date and continues until the Completion Date, or until terminated in accordance with this Section.
3.2 **Termination for Convenience**: Either party may terminate this engagement by providing written notice in accordance with the agreed Notice Period (standard 14 calendar days, unless otherwise specified).
3.3 **Termination for Cause**: Either party may terminate immediately upon written notice if the other party breaches a material provision and fails to cure such breach within 7 business days of receipt of written notice.
3.4 **14-Day Trial Fit Guarantee**: Under the Loopwise 14-Day Fit Guarantee, if within the first 14 calendar days of an engagement either party determines the working relationship is not a fit, Client may initiate a replacement request through the platform for expedited transition or escrow mediation.
3.5 **Post-Termination Payout**: Client shall remain obligated to pay for all verified hours or approved milestones completed prior to the effective date of termination.`,

  engagementGovernance: `### 4. Fractional Rhythm & Communication Cadence
4.1 **Operating Rhythm**: Strategist will provide weekly status updates through the Loopwise Cadence tool detailing completed deliverables, upcoming priorities, identified blockers, and required Client decisions.
4.2 **Client Responsiveness**: Client agrees to review deliverables, acknowledge weekly updates, and provide approvals or constructive change requests within 5 business days of submission.
4.3 **Dispute Escalation**: In the event of a disagreement regarding scope, deliverable quality, or milestone completion, both parties agree to engage Loopwise Platform Mediation prior to initiating external legal proceedings.`,
};

/**
 * Generate full Markdown contract text pre-filled with parties and commercials.
 */
export function buildContractMarkdown({
  title = "Fractional Automation Strategy & Execution Agreement",
  contractTitle,
  clientName,
  clientOrgName,
  clientSignerName,
  strategistName,
  strategistEmail,
  model,
  engagementModel, // RETAINER | HOURLY | FIXED
  rate,
  hourlyWeeklyCap,
  weeklyHours,
  startDate,
  endDate,
  noticePeriodDays = 14,
  scopeOfWork,
  ipKey = "standard_v1",
  confidentialityKey = "mutual_nd_v1",
  terminationKey = "standard_notice_v1",
  customClauses = {},
}) {
  const chosenTitle =
    contractTitle ||
    title ||
    "Fractional Automation Strategy & Execution Agreement";
  const org = clientName || clientOrgName || "Client Enterprise";
  const effectiveModel = model || engagementModel || "RETAINER";

  let compensationDesc = "";
  if (effectiveModel === "HOURLY") {
    compensationDesc = `$${rate}/hr (Weekly Cap: ${hourlyWeeklyCap || 20} hours)`;
  } else if (effectiveModel === "FIXED") {
    compensationDesc = `Fixed Milestone Total of $${Number(rate).toLocaleString()}`;
  } else {
    compensationDesc = `Monthly Retainer of $${Number(rate).toLocaleString()}/month (${weeklyHours || 20} dedicated hours/week)`;
  }

  const startFormatted = startDate
    ? new Date(startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Upon Mutual Electronic Acceptance";

  const endFormatted = endDate
    ? new Date(endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Ongoing (Monthly Renewal until Notice)";

  const ipText =
    IP_ASSIGNMENT_CLAUSES[ipKey]?.text || STANDARD_CLAUSES.ipAssignment;
  const ipTitle =
    IP_ASSIGNMENT_CLAUSES[ipKey]?.title ||
    "Intellectual Property & Work Product Assignment";

  const confText =
    CONFIDENTIALITY_CLAUSES[confidentialityKey]?.text ||
    STANDARD_CLAUSES.confidentiality;
  const confTitle =
    CONFIDENTIALITY_CLAUSES[confidentialityKey]?.title ||
    "Confidentiality & Non-Disclosure";

  const termTemplate =
    TERMINATION_CLAUSES[terminationKey]?.text || STANDARD_CLAUSES.termination;
  const termText = termTemplate.replace(
    "{{noticeDays}}",
    String(noticePeriodDays)
  );

  return `# ${chosenTitle}
**Template Version**: ${CONTRACT_TEMPLATE_VERSION}  
**Governing Platform**: Loopwise Inc. Managed Escrow & Fractional Engagements

---

## PARTIES
- **Client Organization**: ${org} (represented by ${clientSignerName || "Authorized Representative"})
- **Automation Strategist**: ${strategistName || "Appointed Strategist"} (${strategistEmail || "Strategist Contact"})
- **Platform Agent & Escrow Holder**: Loopwise Inc.

---

## COMMERCIAL TERMS & SCHEDULE
- **Engagement Model**: ${effectiveModel}
- **Compensation Rate**: ${compensationDesc}
- **Start Date**: ${startFormatted}
- **Target Completion / Duration**: ${endFormatted}
- **Notice Period for Termination**: ${noticePeriodDays} days written notice

---

## STATEMENT OF WORK (SOW) & OBJECTIVES
${scopeOfWork || "To be defined in engagement deliverables board."}

---

## STANDARD TERMS & CONDITIONS

### 1. ${ipTitle}
${ipText}

### 2. ${confTitle}
${confText}

### 3. Term, Notice Period & Termination
${termText}

${STANDARD_CLAUSES.engagementGovernance}

---
*Notice: This document is executed electronically pursuant to the Electronic Signatures in Global and National Commerce Act (E-SIGN) and the Uniform Electronic Transactions Act (UETA).*
`;
}
