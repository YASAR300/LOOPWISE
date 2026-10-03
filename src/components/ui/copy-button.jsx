"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  className = "",
  size = "sm",
  children,
  onCopied,
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      title={copied ? "Copied!" : "Copy"}
      className={cn(
        "inline-flex items-center justify-center rounded border border-border-hairline bg-surface-raised text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent",
        size === "sm"
          ? "h-6 gap-1 px-1.5 text-2xs"
          : "h-7 gap-1.5 px-2 text-xs",
        copied && "border-semantic-success/30 text-semantic-success",
        className
      )}
    >
      {copied ? (
        <Check className="h-3 w-3 stroke-[2.5] text-semantic-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {children && <span>{copied ? "Copied" : children}</span>}
    </button>
  );
}
