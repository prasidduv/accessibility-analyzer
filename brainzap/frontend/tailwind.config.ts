import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zapPurple: "#7C3AED",
        zapCoral: "#F87060"
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        heading: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
} satisfies Config;
