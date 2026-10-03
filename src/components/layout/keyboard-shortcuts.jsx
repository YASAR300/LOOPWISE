"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

const ShortcutContext = React.createContext({
  openHelp: () => {},
  registerChord: () => () => {},
});

export function KeyboardShortcutProvider({ children }) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = React.useState(false);
  const pendingKeyRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
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

      // Chord detection (e.g. G then X)
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

        if (nextKey === "d") {
          e.preventDefault();
          router.push("/app");
        } else if (nextKey === "c") {
          e.preventDefault();
          router.push("/dev/components");
        } else if (nextKey === "h") {
          e.preventDefault();
          router.push("/");
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
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Quickly navigate through Loopwise using keyboard shortcuts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <h4 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Global
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Command Palette</span>
                  <div className="flex items-center gap-1">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Shortcuts Help</span>
                  <Kbd>?</Kbd>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Navigation Chords
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Go to Dashboard</span>
                  <div className="flex items-center gap-1">
                    <Kbd>G</Kbd>
                    <span className="text-2xs text-text-muted">then</span>
                    <Kbd>D</Kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">
                    Go to Component Showcase
                  </span>
                  <div className="flex items-center gap-1">
                    <Kbd>G</Kbd>
                    <span className="text-2xs text-text-muted">then</span>
                    <Kbd>C</Kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Go to Home</span>
                  <div className="flex items-center gap-1">
                    <Kbd>G</Kbd>
                    <span className="text-2xs text-text-muted">then</span>
                    <Kbd>H</Kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ShortcutContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  return React.useContext(ShortcutContext);
}
