/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        senda: {
          green: {
            DEFAULT: "#1B4332",
            light: "#2D6A4F",
            dark: "#081C15",
            hover: "#143728",
            subtle: "#E8F0EC",
          },
          ochre: {
            DEFAULT: "#C86D3B",
            light: "#D97706",
            dark: "#9C4E23",
            hover: "#B65E2F",
            subtle: "#FBF0EA",
          },
          beige: {
            DEFAULT: "#F8F5F0",
            light: "#FAF7F2",
            dark: "#EDE6DB",
            border: "#E2D7C7",
          },
          ebony: {
            DEFAULT: "#2D231E",
            light: "#4A3B33",
            dark: "#1A1411",
            muted: "#6B5E55",
          },
          gold: {
            DEFAULT: "#E9C46A",
            light: "#F4A261",
            dark: "#D4A373",
          },
          status: {
            funded: "#D97706",
            released: "#16A34A",
            pending: "#CA8A04",
            refunded: "#DC2626",
          },
        },
        background: "#F8F5F0",
        surface: {
          50: "#FAF7F2",
          100: "#F5F0E6",
          200: "#EFE8DC",
          300: "#E5DCCE",
          400: "#D8CCBC",
        },
        brand: {
          primary: "#1B4332",
          secondary: "#C86D3B",
          accent: "#E9C46A",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        senda: "0 10px 25px -5px rgba(27, 67, 50, 0.08), 0 8px 10px -6px rgba(27, 67, 50, 0.04)",
        "senda-card": "0 4px 20px -2px rgba(45, 35, 30, 0.06), 0 2px 6px -1px rgba(45, 35, 30, 0.04)",
        "senda-ochre": "0 10px 25px -5px rgba(200, 109, 59, 0.25)",
        "senda-green": "0 10px 25px -5px rgba(27, 67, 50, 0.35)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
