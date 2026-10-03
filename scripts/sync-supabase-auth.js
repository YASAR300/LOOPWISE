// scripts/sync-supabase-auth.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_USERS = [
  {
    email: "admin@loopwise.internal",
    password: "demo123456",
    name: "Loopwise Admin",
    role: "ADMIN",
  },
  {
    email: "alex.carter@enterprise.ai",
    password: "demo123456",
    name: "Alex Carter",
    role: "CLIENT",
  },
  {
    email: "sarah.lin@apexhealth.io",
    password: "demo123456",
    name: "Dr. Sarah Lin",
    role: "CLIENT",
  },
  {
    email: "elena.rostova@autonomous.ai",
    password: "demo123456",
    name: "Elena Rostova",
    role: "STRATEGIST",
  },
  {
    email: "marcus.chen@agenticlabs.io",
    password: "demo123456",
    name: "Marcus Chen",
    role: "STRATEGIST",
  },
];

async function syncUsers() {
  console.log("🔐 Provisioning Loopwise demo users into Supabase Auth...");

  // List existing users
  const { data: listData, error: listError } =
    await admin.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list Supabase users:", listError.message);
    process.exit(1);
  }

  const existingMap = new Map();
  for (const u of listData.users) {
    existingMap.set(u.email.toLowerCase(), u);
  }

  for (const user of DEMO_USERS) {
    const existing = existingMap.get(user.email.toLowerCase());
    if (existing) {
      console.log(`Updating existing user: ${user.email}`);
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      });
      if (error) console.error(`Error updating ${user.email}:`, error.message);
      else console.log(`✓ Updated ${user.email} (${user.role})`);
    } else {
      console.log(`Creating user: ${user.email}`);
      const { error } = await admin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      });
      if (error) console.error(`Error creating ${user.email}:`, error.message);
      else console.log(`✓ Created ${user.email} (${user.role})`);
    }
  }

  console.log(
    "🎉 All demo accounts provisioned and email-confirmed in Supabase Auth!"
  );
}

syncUsers().catch(console.error);
