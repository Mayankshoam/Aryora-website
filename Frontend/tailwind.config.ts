import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: "#0B3D2E",
          dark: "#082B20",
          light: "#1C5A44",
        },
        champagne: {
          DEFAULT: "#B08D57",
          light: "#D9C3A0",
        },
        ivory: "#F7F5F0",
        ink: "#111111",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [],
};

export default config;
