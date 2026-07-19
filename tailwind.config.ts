import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#05070C",
          50: "#F1F3F7",
          100: "#E0E4EC",
          200: "#BCC3D2",
          300: "#8D97AE",
          400: "#576280",
          500: "#2E3854",
          600: "#181F33",
          700: "#0E121F",
          800: "#080A11",
          900: "#05070C"
        },
        brand: {
          DEFAULT: "#2F5DFF",
          50: "#EEF2FF",
          100: "#DCE6FF",
          200: "#B9CDFF",
          300: "#8FADFF",
          400: "#5C82FF",
          500: "#2F5DFF",
          600: "#1E43DB",
          700: "#1633A8",
          800: "#112675",
          900: "#0B1A4F"
        },
        sky: {
          DEFAULT: "#EAF2FF"
        },
        teal: {
          DEFAULT: "#14C8B0"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      backgroundImage: {
        "id-card": "linear-gradient(135deg, #05070C 0%, #181F33 45%, #2F5DFF 100%)",
        "hero-grid":
          "radial-gradient(circle at 1px 1px, rgba(47,93,255,0.14) 1px, transparent 0)"
      },
      boxShadow: {
        card: "0 1px 2px rgba(8,10,17,0.08), 0 8px 24px -8px rgba(8,10,17,0.16)",
        "card-hover": "0 4px 10px rgba(8,10,17,0.10), 0 16px 32px -12px rgba(8,10,17,0.22)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
export default config;
