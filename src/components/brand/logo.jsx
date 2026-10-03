import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Loopwise Brand Mark SVG (Orange squircle with interconnected autonomous agent loop ribbon)
 */
export function LogoMark({ className = "h-7 w-7", ...props }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform hover:scale-105", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#F25C1F" />
      {/* Abstract interconnected process ribbon */}
      <path
        d="M8 16C8 12 11 9 15 9C19 9 20 13 20 16C20 19 21 23 25 23"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="16" r="2.5" fill="#2B1330" />
      <circle cx="24" cy="16" r="3" fill="#FFFDF9" />
    </svg>
  );
}

/**
 * Full Loopwise Logo with Wordmark in Bricolage Grotesque
 */
export function Logo({
  href = "/",
  markClassName = "h-7 w-7",
  textClassName = "text-lg",
  showWordmark = true,
  className = "",
}) {
  const content = (
    <span
      className={cn("inline-flex select-none items-center gap-2.5", className)}
    >
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-ink",
            textClassName
          )}
        >
          Loopwise
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center"
        aria-label="Loopwise Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function LoopwiseWordmark({ className = "h-6 w-6" }) {
  return <Logo markClassName={className} href={null} />;
}
