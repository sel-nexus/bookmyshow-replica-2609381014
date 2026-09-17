import type { Config } from "tailwindcss";

/**
 * Tailwind design tokens for the BookMyShow Replica.
 *
 * Brand: red / white / black (provided by the PRD). The `primary` ramp is
 * built around the BookMyShow brand red; surfaces are white, foreground is
 * near-black. Semantic role tokens are alpha-capable so they compose with
 * Tailwind `/opacity` modifiers.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BookMyShow brand red ramp (provided brand, primary).
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#e2382f", // brand red anchor
          600: "#c81e1e",
          700: "#a51818",
          800: "#7f1d1d",
          900: "#5c1515",
          950: "#3f0d0d",
        },
        // Neutral scale with a faint warm tint derived from the brand.
        neutral: {
          50: "#faf9f8",
          100: "#f4f3f2",
          200: "#e6e4e3",
          300: "#d1cecc",
          400: "#a8a4a1",
          500: "#7d7875",
          600: "#5b5754",
          700: "#413e3c",
          800: "#2a2826",
          900: "#1a1917",
          950: "#100f0e",
        },
        // Semantic role tokens (alpha-capable).
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-raised": "rgb(var(--color-surface-raised) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        "foreground-muted": "rgb(var(--color-foreground-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        success: {
          DEFAULT: "#15803d",
          light: "#dcfce7",
        },
        error: {
          DEFAULT: "#b91c1c",
          light: "#fee2e2",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(16 15 14 / 0.06), 0 4px 12px rgb(16 15 14 / 0.08)",
        "card-hover":
          "0 4px 8px rgb(16 15 14 / 0.08), 0 12px 28px rgb(16 15 14 / 0.14)",
        glow: "0 0 0 4px rgb(226 56 47 / 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
