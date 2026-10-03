import React from "react";

export function LogoLoader({ label = "Signing you in...", size = "md" }) {
  return (
    <div className="animate-in fade-in flex select-none flex-col items-center justify-center space-y-3.5 p-6 duration-200">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulse ring */}
        <div className="absolute h-12 w-12 animate-ping rounded-2xl bg-brand-accent/20 opacity-75" />
        {/* Logo box */}
        <div className="shadow-xs relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent text-base font-bold text-white">
          L
        </div>
      </div>

      {label && (
        <p className="animate-pulse font-mono text-xs font-semibold tracking-tight text-ink">
          {label}
        </p>
      )}
    </div>
  );
}
