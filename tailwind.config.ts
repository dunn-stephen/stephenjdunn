import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        shell: "var(--color-shell)",
        surface: "var(--color-surface)",
        panel: "var(--color-panel)",
        "panel-alt": "var(--color-panel-alt)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        dim: "var(--color-dim)",
        muted: "var(--color-muted)",
        subtle: "var(--color-subtle)",
        faint: "var(--color-faint)",
        accent: "var(--color-accent)",
        "accent-ink": "var(--color-accent-ink)",
        "accent-surface": "var(--color-accent-surface)"
      },
      boxShadow: {
        terminal: "0 28px 80px rgba(0, 0, 0, 0.52), 0 0 56px rgba(232, 100, 12, 0.06)"
      },
      animation: {
        blink: "blink 1s steps(1) infinite"
      },
      keyframes: {
        blink: {
          "50%": { opacity: "0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
