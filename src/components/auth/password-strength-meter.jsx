"use client";

import React from "react";
import { Check, X } from "lucide-react";

export function evaluatePassword(pwd = "") {
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

  const rules = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "Uppercase letter", met: hasUppercase },
    { label: "Lowercase letter", met: hasLowercase },
    { label: "Number or symbol", met: hasNumberOrSymbol },
  ];

  const score = rules.filter((r) => r.met).length;

  let label = "Very weak";
  let colorClass = "bg-red-500";
  let textColorClass = "text-red-500";

  if (score === 1) {
    label = "Weak";
    colorClass = "bg-red-500";
    textColorClass = "text-red-500";
  } else if (score === 2) {
    label = "Fair";
    colorClass = "bg-amber-500";
    textColorClass = "text-amber-500";
  } else if (score === 3) {
    label = "Good";
    colorClass = "bg-blue-500";
    textColorClass = "text-blue-500";
  } else if (score === 4) {
    label = "Strong";
    colorClass = "bg-emerald-500";
    textColorClass = "text-emerald-500";
  }

  return {
    rules,
    score,
    label,
    colorClass,
    textColorClass,
    isStrong: score === 4,
  };
}

export function PasswordStrengthMeter({ password = "", showRules = true }) {
  if (!password) return null;

  const { rules, score, label, colorClass, textColorClass } =
    evaluatePassword(password);

  return (
    <div className="animate-in fade-in duration-160 space-y-2 pt-1">
      {/* 4 segments meter */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
              score >= step ? colorClass : "bg-line dark:bg-line-2"
            }`}
          />
        ))}
        <span
          className={`ml-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${textColorClass}`}
        >
          {label}
        </span>
      </div>

      {/* Rule Checklist */}
      {showRules && (
        <ul className="grid grid-cols-2 gap-1.5 pt-1">
          {rules.map((rule, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                rule.met
                  ? "font-medium text-emerald-600 dark:text-emerald-400"
                  : "text-ink-3"
              }`}
            >
              {rule.met ? (
                <Check className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span className="bg-ink-3/40 ml-1 mr-0.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              )}
              <span className="truncate">{rule.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
