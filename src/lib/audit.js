// src/lib/audit.js
import { db } from "@/lib/db";

/**
 * Write an entry to the AuditLog table.
 * Safe to call without awaiting — errors are swallowed so they never
 * interrupt the main request flow.
 */
export async function writeAuditLog({
  userId = null,
  orgId = null,
  action,
  entityType,
  entityId = null,
  metadata = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        orgId,
        action,
        entityType,
        entityId,
        metadata,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // Never propagate audit failures
    console.error("[AuditLog] Failed to write:", err?.message);
  }
}

/**
 * Convenience wrappers for common auth events.
 */
export async function logSignIn(userId, metadata) {
  return writeAuditLog({
    userId,
    action: "SIGN_IN",
    entityType: "User",
    entityId: userId,
    metadata,
  });
}

export async function logSignOut(userId) {
  return writeAuditLog({
    userId,
    action: "SIGN_OUT",
    entityType: "User",
    entityId: userId,
  });
}

export async function logPasswordChange(userId) {
  return writeAuditLog({
    userId,
    action: "PASSWORD_CHANGE",
    entityType: "User",
    entityId: userId,
  });
}
