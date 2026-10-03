"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const THEME_COOKIE = "loopwise_theme";

const ThemeContext = createContext({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => null,
});

export function ThemeProvider({ children, initialTheme = "dark" }) {
  const [theme, setThemeState] = useState(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState(
    initialTheme === "system" ? "dark" : initialTheme
  );

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (currentTheme) => {
      let resolved = currentTheme;
      if (currentTheme === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        resolved = systemPrefersDark ? "dark" : "light";
      }

      setResolvedTheme(resolved);
      root.classList.remove("dark", "light");
      root.classList.add(resolved);
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    Cookies.set(THEME_COOKIE, newTheme, { expires: 365, path: "/" });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
