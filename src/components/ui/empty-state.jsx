import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "Get started by creating your first entry.",
  action,
  className = "",
}) {
  return (
    <div
      className={cn(
        "bg-surface-raised/40 flex flex-col items-center justify-center rounded-lg border border-dashed border-border-hairline p-8 text-center",
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border-hairline bg-surface-overlay text-text-secondary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mb-4 max-w-sm text-xs leading-relaxed text-text-secondary">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
