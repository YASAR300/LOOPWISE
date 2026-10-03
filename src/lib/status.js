import React from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  FileEdit,
  PauseCircle,
  XCircle,
  Check,
} from "lucide-react";

/**
 * Global Status System for Loopwise
 * Always displays ICON + TEXT, never color alone.
 * Supports: needs-action, in-progress, complete, draft/not-published, paused/off, failed
 */
export const STATUS_CONFIG = {
  "needs-action": {
    key: "needs-action",
    label: "Needs action",
    icon: AlertCircle,
    className:
      "bg-[#FFECEC] text-[#B42318] border-[#F2B8B8] dark:bg-[#331515] dark:text-[#F87171] dark:border-[#5C2020]",
    dotColor: "bg-[#B42318] dark:bg-[#F87171]",
  },
  "in-progress": {
    key: "in-progress",
    label: "In progress",
    icon: Clock,
    className:
      "bg-[#EEF0FD] text-[#4B3FD6] border-[#C6CBF7] dark:bg-[#1D1C38] dark:text-[#A5B4FC] dark:border-[#323068]",
    dotColor: "bg-[#4B3FD6] dark:bg-[#A5B4FC]",
  },
  complete: {
    key: "complete",
    label: "Complete",
    icon: CheckCircle2,
    className:
      "bg-[#EAF7EE] text-[#1E7A3C] border-[#A9DDB8] dark:bg-[#14291B] dark:text-[#4ADE80] dark:border-[#22502E]",
    dotColor: "bg-[#1E7A3C] dark:bg-[#4ADE80]",
  },
  draft: {
    key: "draft",
    label: "Draft",
    icon: FileEdit,
    className:
      "bg-[#FFF6D6] text-[#8A6A00] border-[#EBD27A] dark:bg-[#2B2510] dark:text-[#FBBF24] dark:border-[#54481C]",
    dotColor: "bg-[#8A6A00] dark:bg-[#FBBF24]",
  },
  "not-published": {
    key: "not-published",
    label: "Not published",
    icon: FileEdit,
    className:
      "bg-[#FFF6D6] text-[#8A6A00] border-[#EBD27A] dark:bg-[#2B2510] dark:text-[#FBBF24] dark:border-[#54481C]",
    dotColor: "bg-[#8A6A00] dark:bg-[#FBBF24]",
  },
  paused: {
    key: "paused",
    label: "Paused",
    icon: PauseCircle,
    className:
      "bg-[#F2EFE8] text-[#5B574F] border-[#DAD3C3] dark:bg-[#262420] dark:text-[#A8A29E] dark:border-[#3D3933]",
    dotColor: "bg-[#5B574F] dark:bg-[#A8A29E]",
  },
  off: {
    key: "off",
    label: "Off",
    icon: PauseCircle,
    className:
      "bg-[#F2EFE8] text-[#5B574F] border-[#DAD3C3] dark:bg-[#262420] dark:text-[#A8A29E] dark:border-[#3D3933]",
    dotColor: "bg-[#5B574F] dark:bg-[#A8A29E]",
  },
  on: {
    key: "on",
    label: "On",
    icon: Check,
    className:
      "bg-[#EAF7EE] text-[#1E7A3C] border-[#A9DDB8] dark:bg-[#14291B] dark:text-[#4ADE80] dark:border-[#22502E]",
    dotColor: "bg-[#1E7A3C] dark:bg-[#4ADE80]",
  },
  failed: {
    key: "failed",
    label: "Failed",
    icon: XCircle,
    className:
      "bg-[#FFECEC] text-[#B42318] border-[#B42318] dark:bg-[#331515] dark:text-[#F87171] dark:border-[#F87171]",
    dotColor: "bg-[#B42318] dark:bg-[#F87171]",
  },
};

/**
 * Normalize any input string to a known status key
 */
export function normalizeStatus(status) {
  if (!status) return "draft";
  const s = String(status).toLowerCase().trim().replace(/_/g, "-");

  if (s.includes("action") || s.includes("review") || s.includes("submitted")) {
    return "needs-action";
  }
  if (s.includes("progress") || s.includes("active") || s.includes("running")) {
    return "in-progress";
  }
  if (
    s.includes("complete") ||
    s.includes("approved") ||
    s.includes("verified") ||
    s.includes("delivered") ||
    s.includes("paid")
  ) {
    return "complete";
  }
  if (s.includes("not-published") || s.includes("unpublished")) {
    return "not-published";
  }
  if (s.includes("draft") || s.includes("pending")) {
    return "draft";
  }
  if (s.includes("pause") || s.includes("suspended") || s.includes("off")) {
    return "paused";
  }
  if (s.includes("fail") || s.includes("rejected") || s.includes("error")) {
    return "failed";
  }
  return STATUS_CONFIG[s] ? s : "in-progress";
}

export function getStatusConfig(status) {
  const key = normalizeStatus(status);
  return STATUS_CONFIG[key] || STATUS_CONFIG["in-progress"];
}
