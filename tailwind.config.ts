import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontWeight: {
        black: "600",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        pertamina: {
          blue: "#0A3D73",
          red: "#ED1C24",
          green: "#85B82A"
        },
        mbm: {
          navy: "#1B2A4A",
          gold: "#D4AF37",
          accent: "#2B4C7E"
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
