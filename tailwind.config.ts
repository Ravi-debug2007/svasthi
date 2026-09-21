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
        // Svasthi tokens (ui-tokens.md) — one intentional light theme.
        canvas: "#F7F8F4",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#20352D",
          muted: "#52655C",
        },
        primary: {
          DEFAULT: "#28624D",
          dark: "#1E4D3C",
          soft: "#E4F0E8",
        },
        lavender: {
          soft: "#EEEAF6",
        },
        peach: {
          soft: "#FFF0E5",
        },
        support: {
          DEFAULT: "#8E3038",
          soft: "#FCEDEF",
        },
        focus: "#3459C7",
      },
    },
  },
  plugins: [],
};
export default config;
