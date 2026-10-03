import React from "react";

export function AuthPanel({ children, className = "" }) {
  return (
    <div
      className={`shadow-2xs mx-auto w-full max-w-[400px] rounded-[20px] border border-line bg-panel p-6 transition-all duration-200 sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}
