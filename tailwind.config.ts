import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff4ed",
          100: "#ffe6d5",
          200: "#fecca9",
          300: "#fda772",
          400: "#fb7738",
          500: "#FF4612", // Official O2 HyperFit vibrant orange-red accent
          600: "#e63507",
          700: "#bf2506",
          800: "#98200b",
          900: "#7b1d0d",
          950: "#430b04",
        },
        dark: {
          700: "#262626",
          750: "#1f1f1f",
          800: "#1a1a1a",
          850: "#151515", // Dark charcoal
          900: "#111111",
          950: "#0A0A0A", // Primary near-black
        },
        surface: {
          50: "#FFFFFF",
          100: "#FBFBFB",
          200: "#F5F5F5", // Light content background
          300: "#EAEAEA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
