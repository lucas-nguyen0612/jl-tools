import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f7f5",
        foreground: "#111111",
        muted: "#f0f0ee",
        accent: "#1f2937"
      }
    }
  },
  plugins: []
} satisfies Config;
