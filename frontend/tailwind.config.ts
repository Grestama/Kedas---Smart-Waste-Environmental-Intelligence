import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kedas Brand Tokens (design_web.md Section 2.2)
        kedas: {
          forest: {
            950: "var(--kedas-forest-950)",
            900: "var(--kedas-forest-900)",
            800: "var(--kedas-forest-800)",
            700: "var(--kedas-forest-700)",
          },
          leaf: {
            600: "var(--kedas-leaf-600)",
            500: "var(--kedas-leaf-500)",
          },
          ivory: {
            50: "var(--kedas-ivory-50)",
          },
          paper: {
            0: "var(--kedas-paper-0)",
          },
          sage: {
            100: "var(--kedas-sage-100)",
            200: "var(--kedas-sage-200)",
          },
          slate: {
            700: "var(--kedas-slate-700)",
            600: "var(--kedas-slate-600)",
            400: "var(--kedas-slate-400)",
          },
          border: "var(--kedas-border)",
        },
        // Existing aliases for backward compatibility
        brand: {
          950: "var(--kedas-forest-950)",
          900: "#1D3F35",
          800: "#1D3F35",
          700: "#2F6552",
          200: "var(--kedas-sage-200)",
          100: "#E8F0E9",
          50: "var(--kedas-ivory-50)",
        },
        canvas: "#F6F6F1",
        surface: "#FFFFFF",
        foreground: "var(--kedas-forest-950)",
        muted: "var(--kedas-slate-600)",
        "text-primary": "#122620",
        "text-secondary": "#53645E",
        "text-muted": "var(--kedas-slate-600)",
        sand: {
          100: "var(--kedas-sage-100)",
          200: "var(--kedas-sage-200)",
        },
        border: "#DDE3DD",
        warning: {
          DEFAULT: "#A96C18",
          bg: "#FAF1E2",
        },
        danger: {
          DEFAULT: "#B5473D",
          bg: "#F9ECEA",
        },
        info: {
          DEFAULT: "#356F89",
          bg: "#EAF2F6",
        },
        success: {
          DEFAULT: "#247A55",
          bg: "#EAF4ED",
        },
      },
      boxShadow: {
        nav: "var(--shadow-nav)",
        card: "var(--shadow-card)",
        popover: "var(--shadow-popover)",
        interactive: "var(--shadow-interactive)",
        "interactive-hover": "var(--shadow-interactive-hover)",
      },
      transitionDuration: {
        instant: "var(--motion-instant)",
        fast: "var(--motion-fast)",
        normal: "var(--motion-normal)",
        emphasis: "var(--motion-emphasis)",
        enter: "var(--motion-enter)",
        slow: "var(--motion-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        enter: "var(--ease-enter)",
        exit: "var(--ease-exit)",
        soft: "var(--ease-soft)",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          '"Cascadia Code"',
          '"Segoe UI Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      borderRadius: {
        control: "8px",
        panel: "14px",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};

export default config;
