/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Soft Modern Bento Grid Architecture Canvas & Cards ──
        canvas: {
          DEFAULT: "#F9F9FB",  // Warm off-white background
          warm:    "#F8F7F4",  // Alternative cream warm baseline
          muted:   "#F1F2F6",  // Subtle container fill
        },
        card: {
          DEFAULT: "#FFFFFF",  // Pure white card baseline
          subtle:  "#FAFAFC",  // Ultra-subtle card backdrop
        },

        // ── High-Contrast Slate / Charcoal Typography ──
        ink: {
          DEFAULT:   "#0F172A",  // Slate-900 high-contrast headlines
          primary:   "#0F172A",
          secondary: "#64748B",  // Slate-500 muted neutral sub-labels
          muted:     "#94A3B8",  // Slate-400 placeholders & subtle info
          subtle:    "#CBD5E1",  // Slate-300 fine dividers
        },

        // ── Ultra-Subtle Pastel Gradients & Accents ──
        pastel: {
          lavender: "#EDE9FE",
          lavenderSoft: "#F5F3FF",
          blue:     "#E0E7FF",
          blueSoft: "#EEF2FF",
          peach:    "#FFEDD5",
          peachSoft:"#FFF7ED",
          cream:    "#FEF3C7",
          mint:     "#ECFDF5",
          mintSoft: "#D1FAE5",
          teal:     "#CCFBF1",
          rose:     "#FFE4E6",
          roseSoft: "#FFF1F2",
        },

        // ── Semantic & Brand Highlights ──
        brand: {
          DEFAULT:  "#0F172A",  // High-contrast primary CTA slate
          indigo:   "#4F46E5",  // Electric Indigo accent
          streak:   "#F97316",  // Streak / Fire badge orange
          success:  "#10B981",  // Mint / emerald success
          live:     "#EF4444",  // Live session red badge
          yellow:   "#F59E0B",  // Star / XP counter amber
        },

        // ── Legacy Aliases to prevent regressions ──
        bg:      "#F9F9FB",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#0F172A",
          light:   "#334155",
          dark:    "#020617",
          orange:  "#F97316",
        },
        muted:   "#64748B",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        "soft-sm": "0 2px 8px -2px rgba(15, 23, 42, 0.04), 0 1px 4px -1px rgba(15, 23, 42, 0.02)",
        "soft-md": "0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
        "soft-lg": "0 16px 36px -6px rgba(15, 23, 42, 0.08), 0 8px 18px -4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

