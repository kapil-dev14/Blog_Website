import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f5edda",
        "paper-shade": "#ebdfc2",
        ink: "#2b2013",
        "ink-soft": "#5f4e37",
        "ink-faint": "#6b5a3c",
        rule: "#d9c8a0",
        accent: "#7a2432",
        gold: "#a9812f",
        cover: "#241811",
        "cover-soft": "#332215",
        "gold-foil": "#c9a15c",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        serif: ["Source Serif 4", "Georgia", "serif"],
        ui: ["Inter", "system-ui", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
