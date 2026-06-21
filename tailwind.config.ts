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
          50: "#fff5f8",
          100: "#ffe4ee",
          200: "#ffc9dd",
          300: "#ffa8cb",
          400: "#ff85b8",
        },
        "sky-blue": {
          50: "#f0fbff",
          100: "#dcf3ff",
          200: "#b8e7ff",
          300: "#8fd9ff",
          400: "#6cc6f5",
        },
        mint: {
          50: "#f1fff7",
          100: "#dbfbe9",
          200: "#b8f4d3",
          300: "#94ecbd",
          400: "#6fd9a4",
        },
        "strawberry-milk": {
          50: "#fff6f5",
          100: "#ffe6e1",
          200: "#ffcec5",
          300: "#ffb3a6",
          400: "#ff9685",
        },
      },
      fontFamily: {
        title: ["var(--font-title)", "sans-serif"],
        cute: ["var(--font-title)", "sans-serif"],
        round: ["var(--font-noto)", "sans-serif"],
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
