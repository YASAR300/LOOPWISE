// src/server/services/pdf-service.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#18181b",
    fontSize: 10,
    lineHeight: 1.45,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 15,
  },
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  badge: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#09090b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#71717a",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#27272a",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f4f4f5",
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  metaItem: {
    width: "50%",
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 8,
    color: "#71717a",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  metaValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#18181b",
  },
  bodyText: {
    fontSize: 9.5,
    color: "#27272a",
    marginBottom: 8,
  },
  signatureContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  signatureBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sigStatus: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 4,
  },
  sigName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  sigAudit: {
    fontSize: 7.5,
    color: "#6b7280",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7.5,
    color: "#a1a1aa",
    borderTopWidth: 0.5,
    borderTopColor: "#f4f4f5",
    paddingTop: 6,
  },
});

export function ContractPDFDocument({ contract, engagement = {} }) {
  const orgName = engagement.organization?.name || "Client Organization";
  const strategistName =
    engagement.strategistProfile?.user?.name || "Strategist";
  const strategistEmail =
    engagement.strategistProfile?.user?.email || "strategist@loopwise.com";

  return (
    <Document title={`Loopwise_Agreement_${contract.id}.pdf`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>LOOPWISE</Text>
            <Text style={styles.badge}>
              {contract.status === "ACTIVE" || contract.status === "ACCEPTED"
                ? "FULLY EXECUTED"
                : `STATUS: ${contract.status}`}
            </Text>
          </View>
          <Text style={styles.title}>
            Fractional Automation Strategy & Execution Agreement
          </Text>
          <Text style={styles.subtitle}>
            Contract ID: {contract.id} • Generated via Loopwise Enterprise
            Platform
          </Text>
        </View>

        {/* Commercial Meta Summary */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Client Organization</Text>
            <Text style={styles.metaValue}>{orgName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Appointed Strategist</Text>
            <Text style={styles.metaValue}>
              {strategistName} ({strategistEmail})
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Engagement Model</Text>
            <Text style={styles.metaValue}>
              {contract.model || engagement.model || "RETAINER"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Agreed Compensation</Text>
            <Text style={styles.metaValue}>
              ${contract.rate || engagement.rate || 0}{" "}
              {contract.model === "HOURLY"
                ? `/hr (cap: ${contract.hourlyWeeklyCap || 20} hrs/wk)`
                : contract.model === "FIXED"
                  ? "total milestone amount"
                  : "/month retainer"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Effective Start Date</Text>
            <Text style={styles.metaValue}>
              {contract.startDate
                ? new Date(contract.startDate).toLocaleDateString()
                : "Upon Execution"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Notice Period</Text>
            <Text style={styles.metaValue}>
              {contract.noticePeriodDays || 14} Calendar Days
            </Text>
          </View>
        </View>

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work & Objectives</Text>
          <Text style={styles.bodyText}>
            {contract.scopeOfWork ||
              "The Strategist shall execute fractional automation architecture, workflow mapping, agent deployments, and telemetry analysis as agreed in the workspace."}
          </Text>
        </View>

        {/* Legal Clauses summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Governance & Core Terms</Text>
          <Text style={styles.bodyText}>
            1. Intellectual Property: All custom code, agent configurations, and
            workflows are assigned to Client as Work Made for Hire upon payment.
          </Text>
          <Text style={styles.bodyText}>
            2. Confidentiality: Both parties agree to strict non-disclosure of
            proprietary workflows, credentials, and business logic.
          </Text>
          <Text style={styles.bodyText}>
            3. Loopwise 14-Day Trial Fit Guarantee: Client retains the right to
            request replacement or escrow refund within the first 14 calendar
            days if not fully satisfied.
          </Text>
        </View>

        {/* E-Signature Audit Box */}
        <View style={styles.signatureContainer}>
          <Text style={styles.sectionTitle}>
            E-Signatures & Audit Trail (E-SIGN / UETA Compliant)
          </Text>
          <View style={styles.signatureRow}>
            {/* Client Signature */}
            <View style={styles.signatureBox}>
              <Text style={styles.sigStatus}>CLIENT ACCEPTANCE</Text>
              <Text style={styles.sigName}>
                {contract.clientSignedName ||
                  (contract.signedByClientAt
                    ? "Authorized Signer"
                    : "Pending Signature")}
              </Text>
              {contract.clientSignedAt ? (
                <>
                  <Text style={styles.sigAudit}>
                    Timestamp: {new Date(contract.clientSignedAt).toUTCString()}
                  </Text>
                  <Text style={styles.sigAudit}>
                    IP Address:{" "}
                    {contract.clientSignedIp || "Logged on secure session"}
                  </Text>
                  <Text style={styles.sigAudit}>
                    User Agent:{" "}
                    {contract.clientSignedUserAgent
                      ? contract.clientSignedUserAgent.slice(0, 45) + "..."
                      : "Verified browser"}
                  </Text>
                </>
              ) : (
                <Text style={styles.sigAudit}>
                  Awaiting electronic execution
                </Text>
              )}
            </View>

            {/* Strategist Signature */}
            <View style={styles.signatureBox}>
              <Text style={styles.sigStatus}>STRATEGIST ACCEPTANCE</Text>
              <Text style={styles.sigName}>
                {contract.strategistSignedName ||
                  (contract.signedByStrategistAt
                    ? strategistName
                    : "Pending Signature")}
              </Text>
              {contract.strategistSignedAt ? (
                <>
                  <Text style={styles.sigAudit}>
                    Timestamp:{" "}
                    {new Date(contract.strategistSignedAt).toUTCString()}
                  </Text>
                  <Text style={styles.sigAudit}>
                    IP Address:{" "}
                    {contract.strategistSignedIp || "Logged on secure session"}
                  </Text>
                  <Text style={styles.sigAudit}>
                    User Agent:{" "}
                    {contract.strategistSignedUserAgent
                      ? contract.strategistSignedUserAgent.slice(0, 45) + "..."
                      : "Verified browser"}
                  </Text>
                </>
              ) : (
                <Text style={styles.sigAudit}>
                  Awaiting electronic execution
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This electronic document was generated and secured by Loopwise.
          Verifiable digital record under UETA & ESIGN Act.
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Generate a PDF Buffer from contract data.
 */
export async function generateContractPdfBuffer(contract, engagement = {}) {
  const element = React.createElement(ContractPDFDocument, {
    contract,
    engagement,
  });
  return await renderToBuffer(element);
}
