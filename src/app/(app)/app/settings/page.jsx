import { getCurrentUser } from "@/lib/auth";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata = {
  title: "Account Settings - Loopwise",
  description: "Manage your profile, password, and notification preferences.",
};

export default async function AppSettingsPage() {
  const user = await getCurrentUser();

  const serializedUser = user
    ? {
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      }
    : null;

  return <SettingsView initialUser={serializedUser} />;
}
