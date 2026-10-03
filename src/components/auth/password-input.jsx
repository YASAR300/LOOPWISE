"use client";

import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export function PasswordInput({
  id = "password",
  name = "password",
  value = "",
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = false,
  disabled = false,
  error = null,
  "aria-describedby": ariaDescribedBy,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const handleKeyUp = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  const handleKeyDown = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={ariaDescribedBy}
          className={`duration-160 focus:outline-hidden h-11 w-full rounded-xl border bg-panel-2 px-3.5 pr-10 text-xs text-ink transition-all placeholder:text-ink-3 focus:border-transparent focus:ring-2 focus:ring-brand-indigo sm:h-11 sm:text-sm md:h-11 ${
            error
              ? "border-[#B42318] focus:ring-[#B42318] dark:border-[#F87171]"
              : "border-line hover:border-line-2"
          } ${className}`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={-1}
          className="absolute right-3 cursor-pointer rounded-md p-1 text-ink-3 transition-colors hover:text-ink"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Caps lock warning banner */}
      {capsLockActive && (
        <div
          role="status"
          className="animate-in fade-in flex items-center gap-1.5 text-[11px] font-medium text-amber-600 duration-100 dark:text-amber-400"
        >
          <AlertCircle className="h-3 w-3" />
          <span>Caps Lock is ON</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          id={ariaDescribedBy}
          className="text-[11px] font-medium text-[#B42318] dark:text-[#F87171]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
