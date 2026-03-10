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
        glass: {
          white: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.15)",
          hover: "rgba(255, 255, 255, 0.13)",
        },
        brand: {
          purple: "#8b5cf6",
          "purple-light": "#c4b5fd",
          blue: "#60a5fa",
          glow: "#c4b5fd",
        },
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-hover":
          "0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
        glow: "0 0 24px rgba(139, 92, 246, 0.55)",
        "glow-blue": "0 0 24px rgba(96, 165, 250, 0.55)",
      },
      backgroundImage: {
        "page-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.3), transparent), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(59,130,246,0.2), transparent)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.12)",
        "glass-bright": "rgba(255, 255, 255, 0.22)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
