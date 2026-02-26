import type { Config } from "tailwindcss";
const woulfai = require("./lib/woulfai-theme");

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: woulfai.colors,
      borderRadius: woulfai.borderRadius,
      boxShadow: woulfai.boxShadow,
      fontFamily: woulfai.fontFamily,
      spacing: woulfai.spacing,
    },
  },
  plugins: [],
};
export default config;
