import { getPlatformStats, getFeaturedStrategists } from "@/lib/stats";
import { HeroSection } from "@/components/marketing/hero";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { ToolMarquee } from "@/components/marketing/tool-marquee";
import { HowItWorksTimeline } from "@/components/marketing/how-it-works";
import { StrategistCarousel } from "@/components/marketing/strategist-carousel";
import { NumbersStrip } from "@/components/marketing/numbers-strip";
import { ComparisonTeaser } from "@/components/marketing/comparison-teaser";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";

export const revalidate = 60; // Revalidate live stats every 60 seconds

export default async function MarketingHomePage() {
  const [stats, featuredStrategists] = await Promise.all([
    getPlatformStats(),
    getFeaturedStrategists(6),
  ]);

  return (
    <div className="relative w-full overflow-x-hidden bg-canvas text-ink">
      {/* 1. Left-aligned Hero with display grotesk headline, dual CTAs, & risograph SVG */}
      <HeroSection />

      {/* 2. Interactive Product Showcase: 5 tabs, peach-to-sage gradient band, floating app window, and live SOP mapper demo */}
      <ProductShowcase />

      {/* 3. Works with integrations strip: slow hover-pause marquee */}
      <ToolMarquee />

      {/* 4. How it works: 4 numbered steps as friendly cards with spot illustrations & identity tiles */}
      <HowItWorksTimeline />

      {/* 5. Strategist showcase: scroll-snap carousel of 6 vetted approved strategists */}
      <StrategistCarousel strategists={featuredStrategists} />

      {/* 6. Live statistics strip from database with count-up animation & calculation tooltips */}
      <NumbersStrip stats={stats} />

      {/* 7. Comparison teaser: clean comparison table (Loopwise vs Freelance vs Agencies) */}
      <ComparisonTeaser />

      {/* 8. Pricing teaser: 3 models (Retainer, Hourly, Fixed) using fees.js */}
      <PricingTeaser />

      {/* 9. FAQ accordion: 6 honest questions */}
      <FaqSection />

      {/* 10. Closing CTA: large rounded cream band with display headline, dual buttons, and spot illustration */}
      <FinalCta />
    </div>
  );
}
