import React from "react";

export function RisoGrainFilter({ id = "riso-grain" }) {
  return (
    <filter id={id} x="0%" y="0%" width="100%" height="100%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.8"
        numOctaves="3"
        result="noise"
      />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0.18 0"
        result="coloredNoise"
      />
      <feComposite in="SourceGraphic" in2="coloredNoise" operator="in" />
    </filter>
  );
}
