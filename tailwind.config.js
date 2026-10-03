/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        surface: {
          base: "var(--bg-base)",
          raised: "var(--bg-raised)",
          overlay: "var(--bg-overlay)",
          card: "var(--bg-card)",
          highlight: "var(--bg-highlight)",
        },
        border: {
          hairline: "var(--border-hairline)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverted: "var(--text-inverted)",
        },
        // Warm Light Automation Platform Design Tokens
        "bg-app": "var(--bg-app)",
        canvas: {
          DEFAULT: "var(--canvas)",
          2: "var(--canvas-2)",
        },
        panel: {
          DEFAULT: "var(--panel)",
          2: "var(--panel-2)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
        },
        line: {
          DEFAULT: "var(--line)",
          2: "var(--line-2)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        forest: {
          DEFAULT: "#1E3B2E",
          text: "#F3F7F4",
        },
        brand: {
          accent: "#F25C1F",
          "accent-btn": "#D94A12",
          "accent-hover": "#DB4A10",
          "accent-soft": "#FFEBE0",
          aubergine: "#2B1330",
          indigo: "#4B3FD6",
          "indigo-hover": "#3D32B8",
          cyan: "#1FC8FF",
          electric: "#2B59FF",
          peach: "#FFB48A",
        },
        tile: {
          violet: "#A9A4F0",
          mint: "#9BE59B",
          coral: "#EC6B4F",
          sun: "#F7C35A",
          pink: "#F27BB3",
          teal: "#3FB28F",
        },
        status: {
          "needs-action-bg": "#FFECEC",
          "needs-action-border": "#F2B8B8",
          "needs-action-text": "#B42318",
          "success-bg": "#EAF7EE",
          "success-border": "#A9DDB8",
          "success-text": "#1E7A3C",
          "warning-bg": "#FFF6D6",
          "warning-border": "#EBD27A",
          "warning-text": "#8A6A00",
          "neutral-bg": "#F2EFE8",
          "neutral-border": "#DAD3C3",
          "neutral-text": "#5B574F",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          glow: "var(--accent-glow)",
        },
        semantic: {
          success: "var(--semantic-success)",
          warning: "var(--semantic-warning)",
          danger: "var(--semantic-danger)",
          info: "var(--semantic-info)",
        },
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "14px" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["14px", { lineHeight: "20px" }],
        md: ["16px", { lineHeight: "24px" }],
        lg: ["20px", { lineHeight: "28px", letterSpacing: "-0.015em" }],
        xl: ["28px", { lineHeight: "34px", letterSpacing: "-0.025em" }],
        "2xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.035em" }],
        h1: [
          "clamp(2.6rem, 6.4vw, 5.2rem)",
          { lineHeight: "1.02", letterSpacing: "-0.035em" },
        ],
        h2: [
          "clamp(2rem, 4vw, 3.2rem)",
          { lineHeight: "1.08", letterSpacing: "-0.025em" },
        ],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        btn: "8px",
        md: "8px",
        lg: "12px",
        xl: "14px",
        mockup: "14px",
        card: "16px",
        showcase: "28px",
        pill: "9999px",
      },
      boxShadow: {
        hairline: "0 0 0 1px var(--border-hairline)",
        glow: "0 0 24px -4px var(--accent-glow)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)",
        "inner-highlight": "inset 0 1px 0 0 var(--highlight-inner)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
        fast: "120ms",
        normal: "160ms",
        slow: "180ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.16, 1, 0.3, 1)",
        linear: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.98)" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fade-out 120ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
