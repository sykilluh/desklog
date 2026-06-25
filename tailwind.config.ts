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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "angel-pink": {
          50: "#fff7fa",
          100: "#ffe9f0",
          200: "#ffd6e5",
          300: "#ffbdd7",
          400: "#fca8c9",
          500: "#ec8bb3",
          600: "#d2658f",
        },
        "sky-blue": {
          50: "#f1f5f7",
          100: "#dee8ec",
          200: "#bbcdd6",
          300: "#8fb0bf",
          400: "#5c8a9c",
          500: "#3c6577",
        },
        mint: {
          50: "#f2f6f1",
          100: "#dde8db",
          200: "#bcd2b8",
          300: "#94b98e",
          400: "#5f9462",
          500: "#3f6f43",
          600: "#2f5533",
        },
        ink: {
          50: "#f5f3f1",
          100: "#e8e3de",
          400: "#4a423c",
          500: "#2a241f",
          600: "#171311",
        },
        "strawberry-milk": {
          50: "#f9f1ee",
          100: "#ece0da",
          200: "#dbbcab",
          300: "#c08a76",
          400: "#a8654f",
          500: "#7a4636",
        },
      },
      fontFamily: {
        title: ["var(--font-title)", "sans-serif"],
        cute: ["var(--font-title)", "sans-serif"],
        round: ["var(--font-noto)", "sans-serif"],
        hand: ["var(--font-hand-en)", "var(--font-hand-kr)", "cursive"],
      },
      animation: {
        "spin-slow": "spin 2.4s linear infinite",
        "float-slow": "float 3s ease-in-out infinite",
        wiggle: "wiggle 1.5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
