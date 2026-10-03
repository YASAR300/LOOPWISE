import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({ steps = [], currentStep = 0, className = "" }) {
  return (
    <div className={cn("flex w-full items-center", className)}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <React.Fragment key={step.title || idx}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-2xs font-semibold transition-colors",
                  isCompleted && "border-accent bg-accent text-white",
                  isCurrent &&
                    "bg-accent/10 ring-accent/20 border-accent text-accent ring-2",
                  !isCompleted &&
                    !isCurrent &&
                    "border-border-hairline bg-surface-raised text-text-muted"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
              </div>
              <div className="hidden sm:block">
                <div
                  className={cn(
                    "text-xs font-medium leading-none",
                    isCurrent ? "text-text-primary" : "text-text-secondary"
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="mt-0.5 text-2xs text-text-muted">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-[1px] flex-1 transition-colors",
                  idx < currentStep ? "bg-accent" : "bg-border-hairline"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
