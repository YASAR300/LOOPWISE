import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Background glow and subtle grid */}
      <div className="radial-glow pointer-events-none absolute inset-0 opacity-60" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-30" />

      {/* Top Logo */}
      <div className="relative z-10 mb-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="bg-accent/20 border-accent/40 flex h-8 w-8 items-center justify-center rounded-md border text-accent transition-colors group-hover:border-accent">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-text-primary">
            Loopwise
          </span>
        </Link>
      </div>

      {/* Centered Card Content */}
      <div className="relative z-10 w-full max-w-sm">{children}</div>

      {/* Footer text */}
      <div className="relative z-10 mt-8 text-center text-2xs text-text-muted">
        <span>Protected by enterprise security & NIST AI RMF governance</span>
      </div>
    </div>
  );
}
