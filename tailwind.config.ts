import type { Config } from "tailwindcss";

/**
 * Tailwind v4: tokens live primarily in `src/app/globals.css` via @theme.
 * This file wires content paths and documents integration with `theme.config.ts`.
 */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
