import { cookies } from "next/headers";
import { bricolage, inter, geistMono } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { KeyboardShortcutProvider } from "@/components/layout/keyboard-shortcuts";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";

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
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icon" }],
    apple: "/apple-icon",
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("loopwise_theme")?.value || "light";
  const initialThemeClass = themeCookie === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      className={`${initialThemeClass} ${bricolage.variable} ${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased selection:bg-brand-accent/20 selection:text-ink">
        <ThemeProvider initialTheme={themeCookie}>
          <ToastProvider>
            <TooltipProvider>
              <KeyboardShortcutProvider>
                <CommandPaletteProvider>{children}</CommandPaletteProvider>
              </KeyboardShortcutProvider>
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
