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
        border: "var(--color-border)",
        text: "var(--color-text)",
        dim: "var(--color-dim)",
        accent: "var(--color-accent)",
        green: "var(--color-green)",
        pink: "var(--color-pink)",
        cyan: "var(--color-cyan)"
      },
      boxShadow: {
        terminal: "0 28px 80px rgba(0, 0, 0, 0.45), 0 0 48px rgba(255, 140, 26, 0.08)"
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        floatIn: "floatIn 500ms ease forwards"
      },
      keyframes: {
        blink: {
          "50%": { opacity: "0" }
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
