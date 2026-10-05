// src/server/services/invoicing.js
import { db } from "@/lib/db";
import { calculateRetainerFees, calculateHourlyFees } from "@/lib/fees";
import { generateInvoicePdfBuffer } from "./invoice-pdf.jsx";

export { generateInvoicePdfBuffer };

/**
 * Generate sequential invoice number (e.g. INV-2026-0042)
 */
export async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  const count = await db.invoice.count();
  const sequence = String(count + 1).padStart(4, "0");
  return `INV-${currentYear}-${sequence}`;
}

/**
 * Generate a monthly Retainer invoice for an active engagement.
 */
export async function generateRetainerInvoice({
  engagementId,
  dueDateDays = 7,
}) {
  const engagement = await db.engagement.findUnique({
    where: { id: engagementId },
    include: {
      organization: true,
      strategistProfile: { include: { user: true } },
    },
  });

  if (!engagement) throw new Error("Engagement not found");
  if (engagement.model !== "RETAINER") {
    throw new Error(`Engagement model is ${engagement.model}, not RETAINER`);
  }

  const now = new Date();
  const dueDate = new Date(Date.now() + dueDateDays * 24 * 60 * 60 * 1000);
  const number = await generateInvoiceNumber();

  const baseAmountCents = Math.round(engagement.rate * 100);
  const fees = calculateRetainerFees(baseAmountCents);

  // Tax calculation if client org has taxRate
  const taxRate = 0; // standard 0% or configurable
  const taxAmount = 0;
  const subtotal = fees.baseAmountCents / 100;
  const platformFee = fees.clientFeeCents / 100;
  const total = subtotal + platformFee + taxAmount;

  const invoice = await db.invoice.create({
    data: {
      number,
      organizationId: engagement.organizationId,
      engagementId: engagement.id,
      invoiceType: "RETAINER",
      subtotal,
      platformFee,
      taxRate,
      taxAmount,
      total,
      currency: "USD",
      status: "OPEN",
      dueDate,
      periodStart: now,
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      recipientName:
        engagement.organization.billingContactName ||
        engagement.organization.name,
      recipientEmail: engagement.organization.billingContactEmail || undefined,
      lines: {
        create: [
          {
            description: `Fractional AI & Automation Retainer - ${engagement.title}`,
            quantity: 1,
            unitPrice: subtotal,
            total: subtotal,
          },
        ],
      },
    },
    include: { lines: true, organization: true, engagement: true },
  });

  // Notify client
  const members = await db.orgMember.findMany({
    where: { organizationId: engagement.organizationId },
  });

  for (const m of members) {
    await db.notification.create({
      data: {
        userId: m.userId,
        type: "INVOICE",
        title: `Invoice Generated: #${invoice.number}`,
        body: `Monthly retainer invoice for "${engagement.title}" is ready. Total: $${invoice.total.toLocaleString()}. Due by ${dueDate.toLocaleDateString()}.`,
        actionUrl: `/client/billing`,
      },
    });
  }

  await db.activityEvent.create({
    data: {
      engagementId: engagement.id,
      actorId: "SYSTEM_BILLING",
      type: "INVOICE_GENERATED",
      title: `Generated Retainer Invoice #${invoice.number} ($${invoice.total.toLocaleString()})`,
      metadata: { invoiceId: invoice.id, number: invoice.number },
    },
  });

  return invoice;
}

/**
 * Generate weekly Hourly invoice from unbilled approved time entries.
 */
export async function generateHourlyInvoice({ engagementId, weekString }) {
  const engagement = await db.engagement.findUnique({
    where: { id: engagementId },
    include: {
      organization: true,
      strategistProfile: { include: { user: true } },
    },
  });

  if (!engagement) throw new Error("Engagement not found");

  const timeEntries = await db.timeEntry.findMany({
    where: {
      engagementId,
      billable: true,
      invoiced: false,
      status: "APPROVED",
      ...(weekString ? { timesheetWeek: weekString } : {}),
    },
    include: { deliverable: true },
  });

  if (timeEntries.length === 0) {
    return null; // Nothing unbilled
  }

  const totalHours = timeEntries.reduce((sum, t) => sum + t.hours, 0);
  const hourlyRateCents = Math.round(engagement.rate * 100);
  const fees = calculateHourlyFees(totalHours, hourlyRateCents);

  const subtotal = fees.baseAmountCents / 100;
  const platformFee = fees.clientFeeCents / 100;
  const total = subtotal + platformFee;
  const number = await generateInvoiceNumber();

  const lines = timeEntries.map((te) => {
    const hours = te.hours;
    const lineTotal = hours * engagement.rate;
    const deliverableLabel = te.deliverable?.title
      ? ` [${te.deliverable.title}]`
      : "";
    return {
      description: `${te.description || "Automation strategy & development"}${deliverableLabel}`,
      quantity: hours,
      unitPrice: engagement.rate,
      total: lineTotal,
    };
  });

  const invoice = await db.invoice.create({
    data: {
      number,
      organizationId: engagement.organizationId,
      engagementId: engagement.id,
      invoiceType: "HOURLY",
      subtotal,
      platformFee,
      total,
      currency: "USD",
      status: "OPEN",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      recipientName:
        engagement.organization.billingContactName ||
        engagement.organization.name,
      recipientEmail: engagement.organization.billingContactEmail || undefined,
      lines: {
        create: lines,
      },
    },
    include: { lines: true, organization: true, engagement: true },
  });

  // Mark time entries as invoiced
  await db.timeEntry.updateMany({
    where: { id: { in: timeEntries.map((t) => t.id) } },
    data: { invoiced: true },
  });

  return invoice;
}

/**
 * Format invoice records to CSV string
 */
export function formatInvoicesToCSV(invoices) {
  const headers = [
    "Invoice Number",
    "Type",
    "Client Organization",
    "Engagement",
    "Issue Date",
    "Due Date",
    "Subtotal (USD)",
    "Platform Fee (USD)",
    "Total (USD)",
    "Status",
    "Paid Date",
  ];

  const rows = invoices.map((inv) => [
    `"${inv.number}"`,
    `"${inv.invoiceType || "RETAINER"}"`,
    `"${inv.organization?.name || ""}"`,
    `"${inv.engagement?.title || ""}"`,
    `"${new Date(inv.createdAt).toISOString().split("T")[0]}"`,
    `"${inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : ""}"`,
    inv.subtotal?.toFixed(2) || "0.00",
    inv.platformFee?.toFixed(2) || "0.00",
    inv.total?.toFixed(2) || "0.00",
    `"${inv.status}"`,
    `"${inv.paidAt ? new Date(inv.paidAt).toISOString().split("T")[0] : ""}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
