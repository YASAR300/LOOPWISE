import React from "react";
import { RisoGrainFilter } from "./grain-filter";

export function SpotIllustration({ variant = "map", className = "h-20 w-20" }) {
  if (variant === "map") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <RisoGrainFilter id="spot-riso-map" />
        </defs>
        {/* Misregistered shadow */}
        <circle cx="52" cy="46" r="28" fill="#2B1330" opacity="0.12" />
        {/* Main shape */}
        <g filter="url(#spot-riso-map)">
          <circle cx="48" cy="42" r="28" fill="#F25C1F" />
        </g>
        <path
          d="M35 42 L62 42"
          stroke="#FFFDF9"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M48 29 L48 55"
          stroke="#FFFDF9"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="68" cy="30" r="6" fill="#2B1330" />
        {/* Ticks */}
        <line
          x1="78"
          y1="22"
          x2="84"
          y2="18"
          stroke="#2B1330"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "match") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <RisoGrainFilter id="spot-riso-match" />
        </defs>
        {/* Two connecting interlocking pill blobs */}
        <rect
          x="22"
          y="32"
          width="34"
          height="34"
          rx="8"
          fill="#2B1330"
          opacity="0.12"
        />
        <g filter="url(#spot-riso-match)">
          <rect x="18" y="28" width="34" height="34" rx="8" fill="#F25C1F" />
        </g>
        <rect x="44" y="38" width="34" height="34" rx="8" fill="#2B1330" />
        <circle cx="61" cy="55" r="7" fill="#F7C35A" />
        <path
          d="M30 45 L40 45"
          stroke="#FFFDF9"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "deploy") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <RisoGrainFilter id="spot-riso-deploy" />
        </defs>
        {/* Isometric mini block with flag */}
        <ellipse cx="50" cy="74" rx="28" ry="8" fill="#2B1330" opacity="0.12" />
        <g filter="url(#spot-riso-deploy)">
          <polygon points="50,22 80,36 50,52 20,36" fill="#F25C1F" />
        </g>
        <polygon points="20,36 50,52 50,80 20,64" fill="#2B1330" />
        <polygon points="80,36 50,52 50,80 80,64" fill="#3D1E44" />
        {/* Little flag / beacon */}
        <line
          x1="50"
          y1="22"
          x2="50"
          y2="8"
          stroke="#F25C1F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <polygon points="50,8 64,13 50,18" fill="#F7C35A" />
      </svg>
    );
  }

  if (variant === "prove") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <RisoGrainFilter id="spot-riso-prove" />
        </defs>
        <rect
          x="22"
          y="24"
          width="56"
          height="56"
          rx="12"
          fill="#2B1330"
          opacity="0.12"
        />
        <rect
          x="18"
          y="20"
          width="56"
          height="56"
          rx="12"
          fill="#FFFDF9"
          stroke="#2B1330"
          strokeWidth="2.5"
        />
        <g filter="url(#spot-riso-prove)">
          <circle cx="46" cy="48" r="18" fill="#F25C1F" />
        </g>
        {/* Checkmark */}
        <path
          d="M38 48 L44 54 L56 40"
          stroke="#FFFDF9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="68" cy="28" r="5" fill="#3FB28F" />
      </svg>
    );
  }

  // variant === "cta"
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <RisoGrainFilter id="spot-riso-cta" />
      </defs>
      <circle cx="64" cy="58" r="38" fill="#2B1330" opacity="0.10" />
      <g filter="url(#spot-riso-cta)">
        <circle cx="58" cy="52" r="38" fill="#F25C1F" />
      </g>
      <rect x="35" y="35" width="46" height="46" rx="10" fill="#2B1330" />
      <circle cx="58" cy="58" r="10" fill="#F7C35A" />
      <line
        x1="88"
        y1="20"
        x2="98"
        y2="12"
        stroke="#2B1330"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="94"
        y1="36"
        x2="106"
        y2="34"
        stroke="#2B1330"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
