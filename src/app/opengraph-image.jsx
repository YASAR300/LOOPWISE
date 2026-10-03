import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Loopwise — Fractional Heads of AI & Automation";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#08090A",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "80px",
        fontFamily: "system-ui, sans-serif",
        border: "2px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            background: "rgba(94, 106, 210, 0.2)",
            border: "1px solid rgba(94, 106, 210, 0.4)",
            color: "#5E6AD2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
          }}
        >
          ✦
        </div>
        <span
          style={{
            color: "#F7F8F8",
            fontSize: "36px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Loopwise
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(94, 106, 210, 0.12)",
            border: "1px solid rgba(94, 106, 210, 0.3)",
            color: "#5E6AD2",
            padding: "6px 16px",
            borderRadius: "9999px",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Fractional Executive Marketplace
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#F7F8F8",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: "960px",
          }}
        >
          Fractional Heads of AI & Autonomous Agent Orchestration
        </h1>
        <p
          style={{
            fontSize: "26px",
            color: "#8A8F98",
            maxWidth: "880px",
            lineHeight: 1.4,
          }}
        >
          Map internal SOPs, deploy autonomous agents with verified ROI, and
          enforce NIST AI RMF governance.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "36px",
          color: "#62666D",
          fontSize: "20px",
          fontWeight: 500,
        }}
      >
        <span>✦ Top 3% Vetted CAIOs</span>
        <span>✦ Real-Time ROI Proof</span>
        <span>✦ EU AI Act & SOC 2 Audited</span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
