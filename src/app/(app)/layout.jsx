import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }) {
  const cookieStore = await cookies();
  const collapsed =
    cookieStore.get("loopwise_sidebar_collapsed")?.value === "true";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar (Desktop 240px -> 56px rail) */}
      <Sidebar initialCollapsed={collapsed} />

      {/* Main App Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
