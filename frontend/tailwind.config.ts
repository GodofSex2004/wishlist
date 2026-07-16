import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#0B0B0C",
          dark: "#121214",
          gray: "#1A1A1E",
          light: "#2A2A30",
          burgundy: "#5A0F1D",
          wine: "#6D1026",
          crimson: "#7D112B",
          ember: "#8A0E28",
          green: "#00ff41",
          purple: "#b300ff",
          cyan: "#00f0ff",
          text: "#e0e0e0",
          muted: "#888888",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Bebas Neue'", "sans-serif"],
      },
      boxShadow: {
        "ember": "0 0 20px rgba(138, 14, 40, 0.25)",
        "ember-lg": "0 0 40px rgba(138, 14, 40, 0.35)",
        "ember-glow": "0 0 15px rgba(138, 14, 40, 0.5)",
        "neon-green": "0 0 20px rgba(0, 255, 65, 0.25)",
        "neon-purple": "0 0 20px rgba(179, 0, 255, 0.25)",
        "neon-cyan": "0 0 20px rgba(0, 240, 255, 0.25)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
}

export default config
