import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      colors: {
        violet: {
          DEFAULT: "#7C5CFF",
          end: "#9D6CFF",
        },
        "blue-accent": "#5A67FF",
        "teal-accent": "#22D3A8",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#22D3A8",
        "bg-primary": "var(--bg-primary)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
      },
      backgroundImage: {
        "violet-gradient": "linear-gradient(135deg, #7C5CFF, #9D6CFF)",
      },
      maxWidth: {
        content: "1280px",
      },
      boxShadow: {
        "violet-glow": "0 0 0 1px rgba(124, 92, 255, 0.4), 0 8px 24px rgba(124, 92, 255, 0.2)",
        card: "0 2px 12px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
