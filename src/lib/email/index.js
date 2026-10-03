// src/lib/email/index.js
// Email sending abstraction — Resend in production, console in development

import { Resend } from "resend";

let resendClient = null;

function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Send a transactional email.
 * Falls back to console.log in development if RESEND_API_KEY is not set.
 */
export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || "Loopwise <notifications@loopwise.ai>";

  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.log("\n📧 [Dev Email]", {
      to,
      subject,
      text: text || "(html only)",
    });
    return { id: "dev-preview", success: true };
  }

  const client = getResendClient();
  if (!client) {
    console.error("[Email] No RESEND_API_KEY configured.");
    return { error: "Email not configured", success: false };
  }

  const { data, error } = await client.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[Email] Resend error:", error);
    return { error, success: false };
  }

  return { id: data?.id, success: true };
}
