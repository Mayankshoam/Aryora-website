import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#FAF8F4",
          pure: "#FFFFFF",
          muted: "#F3EFE8",
          dark: "#ECE7DE",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#5A5752",
          subtle: "#8A8680",
          faint: "#B5B1AA",
        },
        champagne: {
          DEFAULT: "#B89B5E",
          hover: "#A3864A",
          light: "#EADFC7",
          subtle: "#F6F1E5",
          // Accessible gold for text on ivory background (WCAG AA 4.5:1+)
          accessible: "#7A5E20",
        },
        border: {
          subtle: "#E8E5DF",
          medium: "#D5D1C8",
          strong: "#1A1A1A",
        },
        emerald: {
          DEFAULT: "#1B3B30",
          subtle: "#E9F0EC",
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

