// src/server/services/invoice-pdf.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatCentsToCurrency } from "@/lib/fees";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#0f172a",
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 16,
  },
  logo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
  },
  logoSub: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 2,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  invoiceNum: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    marginTop: 2,
  },
  badge: {
    marginTop: 6,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgePaid: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  badgeOpen: {
    backgroundColor: "#fffbeb",
    color: "#d97706",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
  },
  col: {
    width: "48%",
  },
  colTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  partyDetail: {
    fontSize: 8.5,
    color: "#475569",
    marginTop: 1,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colDesc: { width: "55%" },
  colQty: { width: "15%", textAlign: "center" },
  colRate: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalsBox: {
    width: "45%",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 9,
    color: "#475569",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7.5,
    color: "#94a3b8",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
});

export function InvoicePDFDocument({ invoice }) {
  const org = invoice.organization || {};
  const engagement = invoice.engagement || {};
  const strategist = engagement.strategistProfile?.user || {};
  const isPaid = invoice.status === "PAID";

  const lines =
    invoice.lines && invoice.lines.length > 0
      ? invoice.lines
      : [
          {
            id: "line-1",
            description: `Fractional AI Automation Leadership - ${invoice.invoiceType || "Retainer"}`,
            quantity: 1,
            unitPrice: invoice.subtotal || invoice.total,
            total: invoice.subtotal || invoice.total,
          },
        ];

  return (
    <Document title={`Loopwise_Invoice_${invoice.number}.pdf`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>LOOPWISE</Text>
            <Text style={styles.logoSub}>
              Fractional AI Leadership & Automation Platform
            </Text>
            <Text style={styles.logoSub}>Loopwise Inc. · Delaware, USA</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNum}>#{invoice.number}</Text>
            <Text
              style={[
                styles.badge,
                isPaid ? styles.badgePaid : styles.badgeOpen,
              ]}
            >
              {isPaid ? "PAID IN FULL" : `STATUS: ${invoice.status}`}
            </Text>
          </View>
        </View>

        {/* Bill To / From Grid */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Billed To (Client)</Text>
            <Text style={styles.partyName}>
              {org.name || "Client Organization"}
            </Text>
            {org.billingContactName && (
              <Text style={styles.partyDetail}>
                Attn: {org.billingContactName}
              </Text>
            )}
            <Text style={styles.partyDetail}>
              {org.billingContactEmail || org.slug + "@loopwise.client"}
            </Text>
            {org.taxId && (
              <Text style={styles.partyDetail}>Tax / VAT ID: {org.taxId}</Text>
            )}
          </View>

          <View style={styles.col}>
            <Text style={styles.colTitle}>Engagement Details</Text>
            <Text style={styles.partyName}>
              {engagement.title || "Fractional AI Advisory"}
            </Text>
            <Text style={styles.partyDetail}>
              Strategist: {strategist.name || "Appointed Strategist"}
            </Text>
            <Text style={styles.partyDetail}>
              Issue Date: {new Date(invoice.createdAt).toLocaleDateString()}
            </Text>
            {invoice.paidAt && (
              <Text style={styles.partyDetail}>
                Paid Date: {new Date(invoice.paidAt).toLocaleDateString()}
              </Text>
            )}
            {invoice.dueDate && !invoice.paidAt && (
              <Text style={styles.partyDetail}>
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>
              Qty / Hrs
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>
              Amount
            </Text>
          </View>

          {lines.map((line) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colRate}>
                ${line.unitPrice.toLocaleString()}
              </Text>
              <Text style={styles.colTotal}>
                ${line.total.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Summary */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>
                $
                {invoice.subtotal?.toLocaleString() ||
                  invoice.total?.toLocaleString()}
              </Text>
            </View>
            {invoice.platformFee > 0 && (
              <View style={styles.totalRow}>
                <Text>Platform Fee (8%)</Text>
                <Text>${invoice.platformFee.toLocaleString()}</Text>
              </View>
            )}
            {invoice.taxAmount > 0 && (
              <View style={styles.totalRow}>
                <Text>Tax / VAT ({(invoice.taxRate * 100).toFixed(0)}%)</Text>
                <Text>${invoice.taxAmount.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Due (USD)</Text>
              <Text style={styles.grandTotalValue}>
                ${invoice.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Loopwise Inc. · Automated Escrow & Billing · For support, contact
          billing@loopwise.ai · Payment processed via Stripe
        </Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdfBuffer(invoice) {
  const element = React.createElement(InvoicePDFDocument, { invoice });
  return await renderToBuffer(element);
}
