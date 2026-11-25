import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0f172a",
        gold: "#d97706",
        canvas: "#f8fafc",
      },
    },
  },
  plugins: [],
};
export default config;
