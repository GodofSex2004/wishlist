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
          black: "#0a0a0a",
          dark: "#121212",
          gray: "#1e1e1e",
          light: "#2a2a2a",
          neon: "#ff0044",
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
        neon: "0 0 15px rgba(255, 0, 68, 0.3)",
        "neon-lg": "0 0 30px rgba(255, 0, 68, 0.4)",
        "neon-green": "0 0 15px rgba(0, 255, 65, 0.3)",
        "neon-purple": "0 0 15px rgba(179, 0, 255, 0.3)",
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { opacity: "0.5", filter: "brightness(0.8)" },
          "100%": { opacity: "1", filter: "brightness(1.2)" },
        },
      },
    },
  },
  plugins: [],
}

export default config
