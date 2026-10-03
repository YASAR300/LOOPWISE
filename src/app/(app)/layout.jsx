import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import { KeyboardShortcutProvider } from "@/components/layout/keyboard-shortcuts";
import { FloatingHelpButton } from "@/components/ui/floating-help-button";
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
    : {
        id: "demo-client",
        name: "Enterprise Sponsor",
        email: "sponsor@enterprise.com",
        role: "CLIENT",
      };

  return (
    <CommandPaletteProvider>
      <KeyboardShortcutProvider>
        <div className="bg-app flex h-screen w-full overflow-hidden text-ink">
          {/* Sidebar (Desktop 240px -> 56px icon rail) */}
          <Sidebar initialCollapsed={collapsed} currentUser={serializedUser} />

          {/* Main App Content Area with floating panel feel */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar currentUser={serializedUser} />

            {/* Scrollable canvas containing floating white panels */}
            <main className="bg-app flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-8 lg:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav currentUser={serializedUser} />

            {/* Floating Priority Support Chat Bubble */}
            <FloatingHelpButton />
          </div>
        </div>
      </KeyboardShortcutProvider>
    </CommandPaletteProvider>
  );
}
