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
        brand: {
          900: "#1D3F35",
          700: "#2F6552",
          100: "#E8F0E9",
        },
        canvas: "#F6F6F1",
        surface: "#FFFFFF",
        "text-primary": "#1E2A25",
        "text-secondary": "#5D6B63",
        border: "#DCE3DD",
        warning: {
          DEFAULT: "#98631C",
          bg: "#FFF4D9",
        },
        danger: {
          DEFAULT: "#A43F35",
          bg: "#FBEAE7",
        },
        info: {
          DEFAULT: "#315F86",
          bg: "#EAF2F9",
        },
        success: {
          DEFAULT: "#276749",
          bg: "#E7F4EA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        control: "8px",
        panel: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
