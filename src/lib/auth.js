// src/lib/auth.js
// Auth helpers that bridge Supabase Auth → Prisma user records
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

/**
 * Get the currently authenticated user's full Prisma record.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  const user = await db.user.findUnique({
    where: { email: supabaseUser.email, deletedAt: null },
    include: {
      memberships: {
        include: { organization: true },
      },
      notificationPreference: true,
    },
  });

  return user;
}

/**
 * Get active organization from cookie or first membership.
 */
export async function getActiveOrg(user) {
  if (!user || !user.memberships.length) return null;
  return user.memberships[0].organization;
}

/**
 * Sync a Supabase Auth user into the Prisma User table.
 * Called after OAuth sign-in or email verification.
 */
export async function syncSupabaseUser(supabaseUser, role = "CLIENT") {
  const existing = await db.user.findUnique({
    where: { email: supabaseUser.email },
  });

  if (existing) {
    return await db.user.update({
      where: { id: existing.id },
      data: {
        emailVerified: supabaseUser.email_confirmed_at
          ? new Date(supabaseUser.email_confirmed_at)
          : existing.emailVerified,
        image: supabaseUser.user_metadata?.avatar_url || existing.image,
        name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          existing.name,
        updatedAt: new Date(),
      },
    });
  }

  const newUser = await db.user.create({
    data: {
      email: supabaseUser.email,
      name:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        null,
      image: supabaseUser.user_metadata?.avatar_url || null,
      role,
      emailVerified: supabaseUser.email_confirmed_at
        ? new Date(supabaseUser.email_confirmed_at)
        : null,
    },
  });

  // Create default notification preferences
  await db.notificationPreference.create({
    data: { userId: newUser.id },
  });

  return newUser;
}

/**
 * Record sign-in in audit log and return the Prisma user.
 */
export async function handleSignIn(supabaseUser) {
  const user = await syncSupabaseUser(supabaseUser);
  await writeAuditLog({
    userId: user.id,
    action: "SIGN_IN",
    entityType: "User",
    entityId: user.id,
    metadata: { provider: supabaseUser.app_metadata?.provider },
  });
  return user;
}
