import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111318",
        "ink-soft": "#5c6570",
        paper: "#f4f5f7",
        panel: "#ffffff",
        line: "#e6e8ec",
        accent: "#1d4ed8",
        pine: "#0f766e",
      },
      fontFamily: {
        sans: ['ui-sans-serif', "system-ui", "-apple-system", '"Segoe UI"', "Helvetica", "Arial", "sans-serif"],
        serif: ['ui-sans-serif', "system-ui", "-apple-system", '"Segoe UI"', "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 19, 24, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
