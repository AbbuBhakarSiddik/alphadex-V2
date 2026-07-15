/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Legacy dark-theme tokens (keep for backward compat, but updated for Alphadex) ──
        primary: {
          DEFAULT: "#FF6B35",   // orange brand
          light:   "#FF8F5E",   // lighter orange
          dark:    "#E55A24",   // darker orange
        },
        surface: "#FFFFFF",     // white surface
        muted:   "#6B7280",     // gray-500 equivalent

        // ── New light-theme semantic tokens ──
        bg:           "#FAFAFA",   // app background
        ink:          "#1A1A1A",   // primary text

        // ── Brand gradient endpoints (use with expo-linear-gradient) ──
        brand: {
          orange: "#FF6B35",
          red:    "#F72C25",
          "green-start": "#10B981",
          "green-end":   "#34D399",
        },
      },
    },
  },
  plugins: [],
};
