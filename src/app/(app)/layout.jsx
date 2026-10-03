import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }) {
  const cookieStore = await cookies();
  const collapsed =
    cookieStore.get("loopwise_sidebar_collapsed")?.value === "true";

  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    console.error("[AppLayout] Error fetching current user:", err);
  }

  // Format serializable user
  const serializedUser = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.image,
        role: currentUser.role,
        memberships: currentUser.memberships?.map((m) => ({
          role: m.role,
          organization: {
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
          },
        })),
      }
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar (Desktop 240px -> 56px rail) */}
      <Sidebar initialCollapsed={collapsed} currentUser={serializedUser} />

      {/* Main App Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar currentUser={serializedUser} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
