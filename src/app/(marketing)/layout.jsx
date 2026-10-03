import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { AnnouncementBar } from "@/components/marketing/announcement-bar";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { FloatingHelpBubble } from "@/components/marketing/floating-help-bubble";
import { MobileStickyCta } from "@/components/marketing/mobile-sticky-cta";

export const metadata = {
  title: {
    default: "Loopwise | Vetted Fractional Heads of AI & Automation",
    template: "%s | Loopwise",
  },
  description:
    "Hire pre-vetted enterprise AI leaders who map internal SOP workflows into production agent swarms with verified ROI and NIST AI RMF governance.",
};

export default async function MarketingLayout({ children }) {
  // Check cookie dismissal
  const cookieStore = await cookies();
  const isDismissed =
    cookieStore.get("lw_announcement_dismissed")?.value === "true";

  // Query active announcement and active specializations from the database
  let announcement = null;
  let specializations = [];

  try {
    const [foundAnnouncement, foundSpecializations] = await Promise.all([
      db.siteAnnouncement.findFirst({
        where: { active: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.specialization.findMany({
        take: 8,
        orderBy: { name: "asc" },
      }),
    ]);
    announcement = foundAnnouncement;
    specializations = foundSpecializations;
  } catch (err) {
    console.error("Failed to load marketing layout db data:", err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink antialiased selection:bg-brand-accent-soft selection:text-ink">
      {/* 1. Thin deep forest green announcement bar backed by database & cookie */}
      {!isDismissed && announcement && (
        <AnnouncementBar announcement={announcement} />
      )}

      {/* 2. Clean white sticky navbar with dropdowns and mobile sheet */}
      <MarketingNavbar specializations={specializations} />

      {/* 3. Main Marketing Content */}
      <main className="w-full flex-1 bg-canvas">{children}</main>

      {/* 4. Warm dark ink footer */}
      <MarketingFooter />

      {/* 5. Floating contact advisory bubble */}
      <FloatingHelpBubble />

      {/* 6. Mobile sticky bottom CTA */}
      <MobileStickyCta />
    </div>
  );
}
