import type { Config } from "tailwindcss";

// Justin Case Home Pros — Atomic Age (Direction 03) palette
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#164E53", dark: "#0f3a3e" },
        orange: { DEFAULT: "#E66F36", dark: "#cf5d27" },
        cream: { DEFAULT: "#FFF2D5", dark: "#f6e3b8" },
        ink: "#293638",
      },
      fontFamily: {
        display: ["Fredoka", "ui-rounded", "system-ui", "sans-serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
