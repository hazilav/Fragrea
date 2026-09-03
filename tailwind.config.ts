import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08080A",
        foreground: "#F7F5F0",
        noir: {
          950: "#050506",
          900: "#08080A",
          850: "#0E0E11",
          800: "#131317",
          700: "#1A1A20",
          600: "#272730",
        },
        espresso: {
          950: "#0E0A08",
          900: "#15100D",
          800: "#1F1713",
          700: "#2B201A",
          600: "#3D2E26",
        },
        gold: {
          100: "#F5EFE6",
          200: "#E8DCB8",
          300: "#D6BF94",
          400: "#C5A880", // Primary antique gold
          500: "#B8966C",
          600: "#987850",
          700: "#7A5E3C",
        },
        amberGlow: {
          400: "#E5A96F",
          500: "#D49E6A", // Warm amber lighting
          600: "#BA7F47",
        },
        ivory: {
          50: "#FCFAF6",
          100: "#F7F5F0", // Warm silk ivory
          200: "#ECE7DC",
          300: "#DDD6C7",
          400: "#BCB4A3",
          500: "#938C7C",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.22em",
        extrawide: "0.32em",
      },
      boxShadow: {
        'luxury': '0 20px 50px rgba(0, 0, 0, 0.7)',
        'amber-glow': '0 0 35px -5px rgba(212, 158, 106, 0.15)',
        'gold-subtle': '0 0 25px -5px rgba(197, 168, 128, 0.12)',
      },
      borderColor: {
        'gold-subtle': 'rgba(197, 168, 128, 0.18)',
        'gold-dim': 'rgba(197, 168, 128, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
