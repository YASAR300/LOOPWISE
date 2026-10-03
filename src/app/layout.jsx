import { cookies } from "next/headers";
import { inter, geistMono } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { KeyboardShortcutProvider } from "@/components/layout/keyboard-shortcuts";
import { CommandPaletteProvider } from "@/components/layout/command-palette";

export const metadata = {
  title: {
    default: "Loopwise | Marketplace for Fractional Heads of AI & Automation",
    template: "%s | Loopwise",
  },
  description:
    "Hire vetted enterprise automation strategists who map internal workflows and deploy autonomous agents with verified ROI and governance.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("loopwise_theme")?.value || "dark";
  const initialThemeClass = themeCookie === "light" ? "light" : "dark";

  return (
    <html
      lang="en"
      className={`${initialThemeClass} ${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="selection:bg-accent/30 min-h-screen bg-background font-sans text-text-primary antialiased selection:text-white">
        <ThemeProvider initialTheme={themeCookie}>
          <ToastProvider>
            <KeyboardShortcutProvider>
              <CommandPaletteProvider>{children}</CommandPaletteProvider>
            </KeyboardShortcutProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
