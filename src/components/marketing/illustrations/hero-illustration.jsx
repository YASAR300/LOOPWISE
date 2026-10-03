import React from "react";
import { RisoGrainFilter } from "./grain-filter";

export function HeroIllustration({
  className = "w-full max-w-[480px] lg:max-w-[540px] h-auto",
}) {
  return (
    <div className={`relative select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 540 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="float-slow h-auto w-full overflow-visible"
        role="presentation"
      >
        <defs>
          <RisoGrainFilter id="hero-riso-grain" />

          {/* Stipple texture gradient for 3D sphere depth */}
          <radialGradient id="orange-sphere-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFA67A" />
            <stop offset="55%" stopColor="#F25C1F" />
            <stop offset="100%" stopColor="#C43B08" />
          </radialGradient>

          <linearGradient id="cube-side-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3C1A44" />
            <stop offset="100%" stopColor="#2B1330" />
          </linearGradient>

          <linearGradient id="cube-top-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F6F2EA" />
          </linearGradient>
        </defs>

        {/* 1. Misregistered Shadow Background Layers (Aubergine Offset) */}
        <ellipse
          cx="238"
          cy="186"
          rx="90"
          ry="90"
          fill="#2B1330"
          opacity="0.12"
        />
        <ellipse
          cx="140"
          cy="278"
          rx="44"
          ry="44"
          fill="#2B1330"
          opacity="0.10"
        />
        <rect
          x="342"
          y="196"
          width="134"
          height="134"
          rx="8"
          fill="#2B1330"
          opacity="0.12"
        />

        {/* 2. Rough Hand-Drawn Connector Lines */}
        <path
          d="M230 180 C280 185 300 230 350 240"
          stroke="#2B1330"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="6 3"
          opacity="0.75"
        />
        <path
          d="M140 270 C165 240 180 220 220 195"
          stroke="#2B1330"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M230 180 L205 95"
          stroke="#2B1330"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        <path
          d="M350 240 L380 345"
          stroke="#F25C1F"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 3. Workflow Block / Cube Cluster (Right Side) */}
        {/* Cube Base / Front Face */}
        <rect
          x="334"
          y="186"
          width="130"
          height="130"
          rx="10"
          fill="url(#cube-top-grad)"
          stroke="#2B1330"
          strokeWidth="3.5"
        />
        {/* Isometric Side Panel */}
        <path
          d="M464 196 L494 156 L494 286 L464 316 Z"
          fill="url(#cube-side-grad)"
          stroke="#2B1330"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Isometric Top Panel */}
        <path
          d="M334 186 L364 146 L494 156 L464 196 Z"
          fill="#FFFDF9"
          stroke="#2B1330"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Orange Accent Node inside the Cube */}
        <rect x="375" y="228" width="46" height="46" rx="8" fill="#F25C1F" />

        {/* 4. Large Primary Agent Sphere with Risograph Stippled Grain */}
        <g filter="url(#hero-riso-grain)">
          <circle cx="230" cy="175" r="88" fill="url(#orange-sphere-grad)" />
        </g>
        {/* Solid circle overlay for clean stroke definition */}
        <circle
          cx="230"
          cy="175"
          r="88"
          stroke="#2B1330"
          strokeWidth="3"
          opacity="0.3"
        />

        {/* Sphere Stem / Top Leaf Anchor */}
        <path d="M230 87 L226 72 C225 66 235 68 238 72 Z" fill="#2B1330" />

        {/* 5. Left Agent Satellite Blob (Aubergine + Orange) */}
        {/* Connected pill shape */}
        <g filter="url(#hero-riso-grain)">
          <path
            d="M115 250 C115 230 135 220 150 230 C165 240 175 260 175 280 C175 300 155 315 135 310 C115 305 115 270 115 250 Z"
            fill="#F25C1F"
          />
        </g>
        {/* Inner core */}
        <circle cx="140" cy="270" r="14" fill="#2B1330" />

        {/* 6. Orbiting Small Satellite Node (Top) */}
        <circle
          cx="205"
          cy="90"
          r="16"
          fill="#F25C1F"
          stroke="#2B1330"
          strokeWidth="2.5"
        />
        <circle cx="205" cy="90" r="6" fill="#FFFDF9" />

        {/* 7. Tiny Stylized Standing Human Figure with Lantern */}
        {/* Figure stands on a small elevated workflow ledge */}
        <g transform="translate(365, 340)">
          {/* Shadow */}
          <ellipse
            cx="14"
            cy="52"
            rx="16"
            ry="4"
            fill="#2B1330"
            opacity="0.2"
          />

          {/* Head */}
          <circle cx="14" cy="12" r="5.5" fill="#2B1330" />

          {/* Torso & Coat */}
          <path d="M9 18 L19 18 L22 36 L6 36 Z" fill="#2B1330" />

          {/* Legs */}
          <line
            x1="10"
            y1="36"
            x2="8"
            y2="50"
            stroke="#2B1330"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="18"
            y1="36"
            x2="20"
            y2="50"
            stroke="#2B1330"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Arm holding up the strategic lantern */}
          <path
            d="M8 22 L-2 16 L-4 8"
            stroke="#2B1330"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Little Lantern */}
          <rect
            x="-9"
            y="4"
            width="10"
            height="12"
            rx="2"
            fill="#F25C1F"
            stroke="#2B1330"
            strokeWidth="1.5"
          />
          <line
            x1="-4"
            y1="2"
            x2="-4"
            y2="4"
            stroke="#2B1330"
            strokeWidth="1.5"
          />

          {/* Right Arm */}
          <path
            d="M20 22 L28 28"
            stroke="#2B1330"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* 8. Hand-Drawn Spark Ticks & Energy Marks */}
        {/* Left spark ticks */}
        <line
          x1="90"
          y1="230"
          x2="72"
          y2="224"
          stroke="#2B1330"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="94"
          y1="250"
          x2="80"
          y2="260"
          stroke="#2B1330"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="102"
          y1="275"
          x2="84"
          y2="288"
          stroke="#2B1330"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Top spark ticks */}
        <line
          x1="280"
          y1="92"
          x2="294"
          y2="80"
          stroke="#2B1330"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="262"
          y1="78"
          x2="268"
          y2="64"
          stroke="#2B1330"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Right spark ticks near cube */}
        <line
          x1="490"
          y1="135"
          x2="504"
          y2="124"
          stroke="#2B1330"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="506"
          y1="152"
          x2="520"
          y2="150"
          stroke="#2B1330"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
