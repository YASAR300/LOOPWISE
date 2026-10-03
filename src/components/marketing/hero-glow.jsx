"use client";

import React from "react";

/**
 * HeroGlow: Cinematic dark "light-beam" layer inspired by reference designs.
 * @param {Object} props
 * @param {"sweep" | "corner" | "corner-mirrored"} [props.variant="sweep"]
 * @param {string} [props.className]
 */
export function HeroGlow({ variant = "sweep", className = "" }) {
  if (variant === "corner" || variant === "corner-mirrored") {
    const isMirrored = variant === "corner-mirrored";
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
      >
        {/* Soft edge vignette falling to near-black */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,#030610_90%)]" />

        {/* Bottom fade to --bg-0 */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#030610] to-transparent" />

        {/* 1. Left Edge Warm Orange / Peach Glow */}
        <div
          className={`absolute top-1/4 ${
            isMirrored ? "-right-24" : "-left-24"
          } animate-drift-slow h-[480px] w-[420px] rounded-full opacity-60 mix-blend-screen blur-[90px] filter`}
          style={{
            background:
              "radial-gradient(circle, rgba(255, 106, 43, 0.75) 0%, rgba(255, 180, 138, 0.35) 50%, transparent 80%)",
          }}
        />

        {/* 2. Top-Right Diagonal Electric Blue Primary Light Beam */}
        <div
          className={`absolute -top-32 ${
            isMirrored ? "-left-20" : "-right-20"
          } animate-drift-alt h-[780px] w-[260px] opacity-70 mix-blend-screen blur-[75px] filter`}
          style={{
            transform: isMirrored
              ? "rotate(-38deg) skewY(12deg)"
              : "rotate(38deg) skewY(-12deg)",
            background:
              "linear-gradient(180deg, rgba(31, 200, 255, 0.95) 0%, rgba(43, 89, 255, 0.8) 45%, rgba(27, 47, 122, 0.1) 85%)",
          }}
        />

        {/* 3. Secondary Cyan Diagonal Beam with brighter core */}
        <div
          className={`absolute -top-16 ${
            isMirrored ? "left-32" : "right-32"
          } h-[650px] w-[110px] opacity-55 mix-blend-screen blur-[50px] filter`}
          style={{
            transform: isMirrored
              ? "rotate(-34deg) skewY(8deg)"
              : "rotate(34deg) skewY(-8deg)",
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(31, 200, 255, 0.7) 40%, rgba(43, 89, 255, 0.1) 80%)",
          }}
        />

        {/* 4. Ambient Deep Blue Fill */}
        <div
          className="absolute left-1/2 top-1/3 h-[350px] w-[800px] -translate-x-1/2 rounded-full opacity-35 mix-blend-screen blur-[110px] filter"
          style={{
            background:
              "radial-gradient(ellipse, rgba(43, 89, 255, 0.5) 0%, rgba(27, 47, 122, 0.3) 60%, transparent 85%)",
          }}
        />
      </div>
    );
  }

  // Variant: "sweep" (Reference 1: curved sweeping band across lower hero, frosted vertical blurred streaks)
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
    >
      {/* Soft Vignette Edge Falloff */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,#030610_92%)]" />

      {/* Bottom fade to --bg-0 to seamlessly connect to next section */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-[#030610] to-transparent" />

      {/* Frosted vertical blurred streaks behind text (allowed in hero background only, wide gradient bands) */}
      <div className="absolute inset-x-0 top-12 flex justify-center gap-14 opacity-25 mix-blend-screen blur-[55px] filter">
        <div className="via-brand-orange/30 h-[480px] w-28 bg-gradient-to-b from-brand-peach/40 to-transparent" />
        <div className="from-brand-lavender/40 h-[520px] w-36 bg-gradient-to-b via-brand-electric/30 to-transparent" />
        <div className="via-brand-deep/30 h-[480px] w-32 bg-gradient-to-b from-brand-cyan/40 to-transparent" />
        <div className="via-brand-deep/20 h-[440px] w-28 bg-gradient-to-b from-brand-electric/40 to-transparent" />
      </div>

      {/* Main Wide Curved Sweep: Rotated large ellipse sweeping across lower half */}
      <div
        className="animate-drift-slow absolute -bottom-24 left-1/2 h-[420px] w-[1150px] max-w-[130vw] -translate-x-1/2 rounded-[100%] opacity-80 mix-blend-screen blur-[75px] filter"
        style={{
          transform: "translateX(-50%) rotate(-4deg)",
          background:
            "linear-gradient(90deg, rgba(255, 106, 43, 0.75) 0%, rgba(255, 180, 138, 0.65) 28%, rgba(43, 89, 255, 0.75) 68%, rgba(31, 200, 255, 0.85) 100%)",
        }}
      />

      {/* Secondary Cyan Edge Streak across upper-curve */}
      <div
        className="animate-drift-alt absolute bottom-16 left-1/2 h-[90px] w-[780px] -translate-x-[45%] rounded-full opacity-60 mix-blend-screen blur-[45px] filter"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 180, 138, 0.4) 30%, rgba(31, 200, 255, 0.8) 75%, transparent 100%)",
        }}
      />

      {/* Warm Ambient Underglow on the left */}
      <div
        className="absolute -left-16 bottom-4 h-[320px] w-[420px] rounded-full opacity-50 mix-blend-screen blur-[85px] filter"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 106, 43, 0.7) 0%, rgba(255, 180, 138, 0.3) 60%, transparent 80%)",
        }}
      />
    </div>
  );
}
