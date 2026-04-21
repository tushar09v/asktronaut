/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        base: "#0a0a0a",
        surface: "#111111",
        elevated: "#1a1a1a",
        "border-subtle": "#222222",
        accent: {
          DEFAULT: "#38bdf8",
          dim: "#0ea5e9",
          muted: "#0c4a6e",
          tint: "rgba(56,189,248,0.08)",
        },
        text: {
          primary: "#f4f4f5",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.7" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        "fade-up": "fade-up 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
