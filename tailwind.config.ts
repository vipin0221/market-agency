import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1915",
        "ink-soft": "#4a433a",
        paper: "#f3efe6",
        panel: "#fffdf8",
        line: "#e0d6c8",
        accent: "#9a3412",
        pine: "#1f4d3a",
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', "Palatino", "Georgia", "serif"],
        sans: ['"Avenir Next"', "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(28, 25, 21, 0.04), 0 12px 32px rgba(28, 25, 21, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
