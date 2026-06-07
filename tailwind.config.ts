import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f4f0e8",
        ink: "#282a26",
        muted: "#77786f",
        line: "#dcd6ca",
        moss: "#66715c",
        apricot: "#d8a879",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        postcard: "0 24px 70px rgba(53, 47, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
