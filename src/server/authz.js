// src/server/authz.js
// Authorization helpers — server-only, never import in client components
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit";

/**
 * Require an authenticated user. Redirects to /login if not signed in.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Require a specific role. Redirects to /403 if role doesn't match.
 */
export async function requireRole(role) {
  const user = await requireUser();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) {
    redirect("/403");
  }
  return user;
}

/**
 * Require the user to be a member of an org with at least the given role level.
 * Role hierarchy: OWNER > ADMIN > MEMBER
 */
const ORG_ROLE_RANK = { MEMBER: 1, ADMIN: 2, OWNER: 3 };

export async function requireOrgMember(orgId, minRole = "MEMBER") {
  const user = await requireUser();
  const membership = user.memberships?.find((m) => m.organizationId === orgId);
  if (!membership) redirect("/403");
  const userRank = ORG_ROLE_RANK[membership.role] ?? 0;
  const requiredRank = ORG_ROLE_RANK[minRole] ?? 1;
  if (userRank < requiredRank) redirect("/403");
  return { user, membership };
}

/**
 * Assert the authenticated user owns a resource.
 * Throws a 403 redirect if they don't.
 *
 * @param {Object} resource - DB record with an ownerId or userId field
 * @param {string[]} [ownerFields] - fields to check (default: ['userId','ownerId','createdById'])
 */
export async function assertOwns(
  resource,
  ownerFields = ["userId", "ownerId", "createdById"]
) {
  const user = await requireUser();
  const owns = ownerFields.some((f) => resource[f] === user.id);
  if (!owns) redirect("/403");
  return user;
}

/**
 * Check auth without redirecting — returns null if not authorized.
 */
export async function getOptionalUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

/**
 * Log an authorization decision. Use for sensitive actions.
 */
export async function logAuthzEvent(
  userId,
  action,
  entityType,
  entityId,
  metadata
) {
  await writeAuditLog({
    userId,
    action,
    entityType,
    entityId,
    metadata,
  });
}
