import { getPlatformStats } from "@/lib/stats";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthLayout({ children }) {
  const stats = await getPlatformStats();

  return <AuthShell stats={stats}>{children}</AuthShell>;
}
