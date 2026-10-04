"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Home,
  Briefcase,
  Bot,
  FileText,
  CreditCard,
  Settings,
  Sparkles,
  Users,
  Compass,
  Moon,
  Sun,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { Kbd } from "@/components/ui/kbd";

const CommandContext = createContext({
  open: false,
  setOpen: () => {},
  registerCommands: () => () => {},
});

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Global Cmd+K / Ctrl+K listener and custom event listener
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  const runCommand = (action) => {
    setOpen(false);
    action();
  };

  return (
    <CommandContext.Provider
      value={{ open, setOpen, registerCommands: () => () => {} }}
    >
      {children}
      {open && (
        <div className="bg-ink/40 backdrop-blur-xs animate-in fade-in fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 dark:bg-black/75">
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="shadow-warm relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-panel text-ink">
            <Command className="w-full bg-transparent text-ink" loop>
              <div className="flex items-center border-b border-line px-3.5 py-3">
                <Search className="mr-2.5 h-4 w-4 shrink-0 text-ink-3" />
                <Command.Input
                  placeholder="Type a command or jump to screen..."
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
                  autoFocus
                />
                <kbd className="rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-2xs text-ink-3">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-xs text-ink-3">
                  No matching results found.
                </Command.Empty>

                {/* Primary Navigation */}
                <Command.Group
                  heading="Navigation"
                  className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-3"
                >
                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/client/dashboard"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Home className="mr-2.5 h-3.5 w-3.5 text-ink-3" />
                    <span>Client Dashboard</span>
                    <span className="ml-auto font-mono text-[10px] text-ink-3">
                      G then H
                    </span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/client/engagements"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Briefcase className="mr-2.5 h-3.5 w-3.5 text-ink-3" />
                    <span>Active Engagements</span>
                    <span className="ml-auto font-mono text-[10px] text-ink-3">
                      G then E
                    </span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/client/agents"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Bot className="mr-2.5 h-3.5 w-3.5 text-brand-accent" />
                    <span>Autonomous Agents Fleet</span>
                    <span className="ml-auto font-mono text-[10px] text-ink-3">
                      G then A
                    </span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/client/briefs"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <FileText className="mr-2.5 h-3.5 w-3.5 text-ink-3" />
                    <span>Workflow Briefs</span>
                    <span className="ml-auto font-mono text-[10px] text-ink-3">
                      G then B
                    </span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/client/briefs"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Sparkles className="mr-2.5 h-3.5 w-3.5 text-brand-indigo" />
                    <span>Find matches for brief…</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/client/proposals"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Layers className="mr-2.5 h-3.5 w-3.5 text-brand-accent" />
                    <span>Open proposal…</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/client/shortlist"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Users className="mr-2.5 h-3.5 w-3.5 text-tile-teal" />
                    <span>Client Shortlist</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/strategists"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Compass className="mr-2.5 h-3.5 w-3.5 text-forest" />
                    <span>Browse AI Leaders Directory</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/app/roi"))}
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Sparkles className="mr-2.5 h-3.5 w-3.5 text-tile-coral" />
                    <span>ROI Telemetry & Compliance</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/app/billing"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <CreditCard className="mr-2.5 h-3.5 w-3.5 text-ink-3" />
                    <span>Billing & Escrow Ledgers</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/app/settings"))
                    }
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Settings className="mr-2.5 h-3.5 w-3.5 text-ink-3" />
                    <span>Settings & Preferences</span>
                    <span className="ml-auto font-mono text-[10px] text-ink-3">
                      G then S
                    </span>
                  </Command.Item>
                </Command.Group>

                {/* Theme Options */}
                <Command.Group
                  heading="Appearance"
                  className="mt-2 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-3"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme("light"))}
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Sun className="mr-2.5 h-3.5 w-3.5 text-ink-3" />
                    <span>Switch to Warm Light Theme</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => setTheme("dark"))}
                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-ink aria-selected:bg-panel-2 aria-selected:text-brand-indigo"
                  >
                    <Moon className="mr-2.5 h-3.5 w-3.5 text-ink-3" />
                    <span>Switch to Warm Dark Theme</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </CommandContext.Provider>
  );
}

export function useCommandPalette() {
  return useContext(CommandContext);
}
