// src/lib/supabase/admin.js
// Admin client with service role key — server-only, never import in browser
import { createClient } from "@supabase/supabase-js";

let adminClient = null;

export function getAdminClient() {
  if (adminClient) return adminClient;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  return adminClient;
}
