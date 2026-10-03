"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { ShortcutSheet } from "@/components/ui/shortcut-sheet";

const ShortcutContext = createContext({
  openHelp: () => {},
});

export function KeyboardShortcutProvider({ children }) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const pendingKeyRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleOpenShortcut = () => setHelpOpen(true);
    window.addEventListener("open-shortcut-sheet", handleOpenShortcut);
    return () =>
      window.removeEventListener("open-shortcut-sheet", handleOpenShortcut);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input, textarea, or contentEditable
      const target = e.target;
      if (
        target &&
        typeof target.closest === "function" &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[role='dialog']"))
      ) {
        return;
      }

      // Open help dialog on "?"
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
        return;
      }

      // "C" shortcut to create new
      if (
        e.key.toLowerCase() === "c" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !pendingKeyRef.current
      ) {
        e.preventDefault();
        const createBtn = document.querySelector(
          "[title*='New brief'], [title*='New proposal'], [title*='New user'], a[href*='/new']"
        );
        if (createBtn) createBtn.click();
        return;
      }

      // Chord detection (G then X)
      if (
        e.key.toLowerCase() === "g" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !pendingKeyRef.current
      ) {
        pendingKeyRef.current = "g";
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          pendingKeyRef.current = null;
        }, 1200);
        return;
      }

      if (pendingKeyRef.current === "g") {
        const nextKey = e.key.toLowerCase();
        pendingKeyRef.current = null;
        clearTimeout(timeoutRef.current);

        if (nextKey === "h") {
          e.preventDefault();
          router.push("/client/dashboard");
        } else if (nextKey === "e") {
          e.preventDefault();
          router.push("/client/engagements");
        } else if (nextKey === "a") {
          e.preventDefault();
          router.push("/client/agents");
        } else if (nextKey === "b") {
          e.preventDefault();
          router.push("/client/briefs");
        } else if (nextKey === "s") {
          e.preventDefault();
          router.push("/app/settings");
        } else if (nextKey === "d") {
          e.preventDefault();
          router.push("/dev/design");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [router]);

  return (
    <ShortcutContext.Provider value={{ openHelp: () => setHelpOpen(true) }}>
      {children}
      <ShortcutSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </ShortcutContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  return useContext(ShortcutContext);
}
