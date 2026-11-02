import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Miss Jo Signature Cream & Alabaster Palette
        cream: {
          DEFAULT: "#F5F0EA", // Miss Jo Signature Cream (--mj-cream)
          light: "#FDFBF9",   // Luminous soft white page background
          pure: "#FFFFFF",    // Pure white for cards & clean surfaces
          warm: "#F0EADF",    // Miss Jo Warm Linen / Sand
          soft: "#F7F5EF",    // Miss Jo Alabaster Silk
          dark: "#EFEBE4",    // Shaded cream for active states
        },
        // Ivory aliases mapped to Miss Jo luminous warm palette
        ivory: {
          DEFAULT: "#FDFBF9",
          pure: "#FFFFFF",
          muted: "#F5F0EA",
          warm: "#F0EADF",
          dark: "#EFEBE4",
        },
        // Miss Jo Soft Charcoal & Slate Typography (--mj-black, --mj-mid, --mj-light)
        ink: {
          DEFAULT: "#1A1A1A",   // Miss Jo Primary Charcoal (--mj-black)
          dark: "#141414",
          charcoal: "#353535",   // Miss Jo Deep Slate
          muted: "#4A4A4A",     // Miss Jo Mid Slate (--mj-mid)
          subtle: "#7B7B7B",    // Miss Jo Secondary Gray
          faint: "#9A9A9A",     // Miss Jo Light Gray (--mj-light)
          light: "#C4C0B9",
        },
        // Miss Jo Signature Rose Gold / Terracotta Accent (#C09981)
        terracotta: {
          DEFAULT: "#C09981",   // Miss Jo Signature Rose Gold Accent
          hover: "#A97B63",     // Richer terracotta hover
          light: "#D1B9A7",     // Miss Jo Cashmere Nude
          subtle: "#F9F4F0",    // Soft blush tint
          accessible: "#8E5B42", // WCAG AA 4.5:1+ accessible terracotta on cream
        },
        // Champagne alias mapped to Miss Jo warm metallic rose-gold & champagne
        champagne: {
          DEFAULT: "#C09981",   // Miss Jo Rose Gold Accent
          hover: "#A97B63",
          light: "#D1B9A7",
          subtle: "#F9F4F0",
          accessible: "#8E5B42",
        },
        // Miss Jo Muted Natural Borders (--mj-border: #DDD8D0)
        border: {
          subtle: "#DDD8D0",    // Miss Jo Signature Border (--mj-border)
          light: "#EAE5DE",     // Delicate divider
          medium: "#D4CFC5",    // Mid divider
          strong: "#1A1A1A",
        },
        // Miss Jo Emerald Trust & Assurance Accent (#108474)
        emerald: {
          DEFAULT: "#108474",   // Miss Jo Signature Teal-Emerald
          dark: "#0C6155",
          hover: "#0E7567",
          subtle: "#EAF3DE",    // Miss Jo Mint Tint
        },
        // Miss Jo Slate Card / Film Backdrop (#353535)
        slate: {
          mj: "#353535",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      letterSpacing: {
        widest2: "0.2em",
        luxury: "0.18em",
      },
      transitionDuration: {
        luxury: "400ms",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 400ms ease-out forwards",
        slideDown: "slideDown 300ms ease-out forwards",
        slideLeft: "slideLeft 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
