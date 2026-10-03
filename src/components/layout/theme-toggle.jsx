"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Toggle theme (currently ${theme})`}
      title={`Theme: ${theme}`}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-hairline bg-surface-raised text-text-secondary transition-colors duration-fast hover:border-border-subtle hover:bg-surface-overlay hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${className}`}
    >
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "system" && <Laptop className="h-4 w-4" />}
    </button>
  );
}
