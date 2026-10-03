"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Home,
  LayoutDashboard,
  Palette,
  LogIn,
  Moon,
  Sun,
  Laptop,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useKeyboardShortcuts } from "./keyboard-shortcuts";
import { Kbd } from "@/components/ui/kbd";

const CommandContext = React.createContext({
  open: false,
  setOpen: () => {},
  registerCommands: () => () => {},
});

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = React.useState(false);
  const [customCommands, setCustomCommands] = React.useState([]);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { openHelp } = useKeyboardShortcuts();

  // Global Cmd+K / Ctrl+K listener
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const registerCommands = React.useCallback((cmds) => {
    setCustomCommands((prev) => [...prev, ...cmds]);
    return () => {
      setCustomCommands((prev) =>
        prev.filter((c) => !cmds.some((nc) => nc.id === c.id))
      );
    };
  }, []);

  const runCommand = (commandAction) => {
    setOpen(false);
    commandAction();
  };

  return (
    <CommandContext.Provider value={{ open, setOpen, registerCommands }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-lg border border-border-hairline bg-surface-raised shadow-2xl">
            <Command className="w-full bg-transparent text-text-primary" loop>
              <div className="flex items-center border-b border-border-hairline px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                  autoFocus
                />
                <Kbd>ESC</Kbd>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-xs text-text-muted">
                  No matching results found.
                </Command.Empty>

                {/* Built-in Navigation Group */}
                <Command.Group
                  heading="Navigation"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/"))}
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <Home className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>Home & Overview</span>
                    <span className="ml-auto text-2xs text-text-muted">
                      G then H
                    </span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/app"))}
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>App Shell / Dashboard</span>
                    <span className="ml-auto text-2xs text-text-muted">
                      G then D
                    </span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() =>
                      runCommand(() => router.push("/dev/components"))
                    }
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <Palette className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>UI Design System Showcase</span>
                    <span className="ml-auto text-2xs text-text-muted">
                      G then C
                    </span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/login"))}
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <LogIn className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>Login & Authentication</span>
                  </Command.Item>
                </Command.Group>

                {/* Theme Options */}
                <Command.Group
                  heading="Preferences & Theme"
                  className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme("dark"))}
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <Moon className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>Set Theme to Dark</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => setTheme("light"))}
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <Sun className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>Set Theme to Light</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => setTheme("system"))}
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <Laptop className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>Set Theme to System Default</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => runCommand(() => openHelp())}
                    className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                  >
                    <HelpCircle className="mr-2 h-3.5 w-3.5 text-text-muted" />
                    <span>Show Keyboard Shortcuts Sheet</span>
                    <span className="ml-auto text-2xs text-text-muted">?</span>
                  </Command.Item>
                </Command.Group>

                {/* Dynamically Registered Commands from Later Prompts */}
                {customCommands.length > 0 && (
                  <Command.Group
                    heading="Actions"
                    className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted"
                  >
                    {customCommands.map((cmd) => (
                      <Command.Item
                        key={cmd.id}
                        onSelect={() => runCommand(cmd.action)}
                        className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text-primary aria-selected:bg-surface-highlight aria-selected:text-accent"
                      >
                        {cmd.icon && (
                          <span className="mr-2 shrink-0">{cmd.icon}</span>
                        )}
                        <span>{cmd.label}</span>
                        {cmd.shortcut && (
                          <span className="ml-auto text-2xs text-text-muted">
                            {cmd.shortcut}
                          </span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </CommandContext.Provider>
  );
}

export function useCommandPalette() {
  return React.useContext(CommandContext);
}
