import { LogoMark } from "@/components/brand/logo";

export function LogoLoader({ label = "Signing you in...", size = "md" }) {
  return (
    <div className="animate-in fade-in flex select-none flex-col items-center justify-center space-y-3.5 p-6 duration-200">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulse ring */}
        <div className="absolute h-12 w-12 animate-ping rounded-2xl bg-brand-accent/20 opacity-75" />
        {/* Brand Logo Mark */}
        <LogoMark className="shadow-xs relative h-10 w-10" />
      </div>

      {label && (
        <p className="animate-pulse font-mono text-xs font-semibold tracking-tight text-ink">
          {label}
        </p>
      )}
    </div>
  );
}
