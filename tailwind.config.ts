import type { Config } from "tailwindcss";

/**
 * All color scales resolve to CSS variables (--tw-<name>-<shade>) declared in
 * globals.css and OVERRIDDEN at request time by the (site)/(studio) layouts
 * from the `theme` table in the database. So the palette is fully driven by
 * the admin dashboard's Theme editor.
 *
 * The `<alpha-value>` placeholder is a Tailwind opacity hook — it makes every
 * shade responsive to opacity modifiers like `bg-rosewood-400/50`.
 */
const s = (name: string) => ({
  50: `rgb(var(--tw-${name}-50) / <alpha-value>)`,
  100: `rgb(var(--tw-${name}-100) / <alpha-value>)`,
  200: `rgb(var(--tw-${name}-200) / <alpha-value>)`,
  300: `rgb(var(--tw-${name}-300) / <alpha-value>)`,
  400: `rgb(var(--tw-${name}-400) / <alpha-value>)`,
  500: `rgb(var(--tw-${name}-500) / <alpha-value>)`,
  600: `rgb(var(--tw-${name}-600) / <alpha-value>)`,
  700: `rgb(var(--tw-${name}-700) / <alpha-value>)`,
  800: `rgb(var(--tw-${name}-800) / <alpha-value>)`,
  900: `rgb(var(--tw-${name}-900) / <alpha-value>)`,
});

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: `rgb(var(--tw-cream-50) / <alpha-value>)`,
          100: `rgb(var(--tw-cream-100) / <alpha-value>)`,
          200: `rgb(var(--tw-cream-200) / <alpha-value>)`,
          300: `rgb(var(--tw-cream-300) / <alpha-value>)`,
          400: `rgb(var(--tw-cream-400) / <alpha-value>)`,
        },
        blush: s("blush"),
        rosewood: s("rosewood"),
        sage: s("sage"),
        sky: s("sky"),
        lagoon: s("lagoon"),
        navy: {
          ...s("navy"),
          950: `rgb(var(--tw-navy-950, 10 15 20) / <alpha-value>)`,
        },
        cornflower: s("cornflower"),
        violet: s("violet"),
        lavender: s("lavender"),
        plum: s("plum"),
        pink: s("pink"),
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 9vw, 8rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.06", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.5rem, 2.5vw, 2.125rem)", { lineHeight: "1.16", letterSpacing: "-0.015em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75" }],
        "body-md": ["1rem", { lineHeight: "1.7" }],
      },
      borderRadius: {
        glass: "1.25rem",
        "glass-lg": "1.75rem",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgb(255 255 255 / 0.55) inset, 0 8px 32px -8px rgb(var(--fg) / 0.18)",
        "glass-lg": "0 1px 0 0 rgb(255 255 255 / 0.6) inset, 0 24px 64px -16px rgb(var(--fg) / 0.22)",
        lift: "0 32px 80px -20px rgb(var(--fg) / 0.28)",
        glow: "0 0 48px -6px rgb(var(--theme-accent) / 0.35)",
      },
      backdropBlur: {
        glass: "16px",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
        cinematic: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(3%, -4%, 0) scale(1.06)" },
          "66%": { transform: "translate3d(-3%, 3%, 0) scale(0.96)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 50%" },
          "100%": { backgroundPosition: "-200% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translate3d(0, 16px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        drift: "drift 28s cubic-bezier(0.45,0,0.55,1) infinite",
        "drift-slow": "drift 44s cubic-bezier(0.45,0,0.55,1) infinite",
        shimmer: "shimmer 6s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
