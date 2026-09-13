/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Alphadex Minimalist Black & Off-White Design Tokens ──
        dark: {
          bg:        "#000000",   // pure black canvas
          surface1:  "#0F0F0F",   // card / container level 1
          surface2:  "#1A1A1A",   // elevated / pill level 2
          surface3:  "#262626",   // active / hover level 3
          border:    "#222222",   // subtle hairline border
          borderLight: "rgba(255, 255, 255, 0.08)",
        },
        offwhite: {
          DEFAULT:   "#F5F5F7",   // primary high-contrast text
          pure:      "#FFFFFF",   // pure white active accents
          muted:     "#A1A1AA",   // secondary metadata text
          subtle:    "#71717A",   // tertiary subtle icons/text
        },

        // ── Brand & Semantic Tokens ──
        primary: {
          DEFAULT: "#FFFFFF",   // off-white high contrast
          light:   "#F5F5F7",
          dark:    "#E5E5E5",
          orange:  "#FF6B35",   // legacy alias
        },
        surface: "#0F0F0F",     // dark surface
        muted:   "#A1A1AA",     // secondary gray

        bg:      "#000000",     // app background
        ink:     "#F5F5F7",     // primary text

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
