/**
 * Single source of truth for design tokens (colors, typography).
 * HSL channels are space-separated for Tailwind opacity: hsl(var(--token) / 0.5)
 */

export type HslChannels = { h: number; s: number; l: number };
export type RgbChannels = { r: number; g: number; b: number };

export const themeConfig = {
  colors: {
    light: {
      background: { h: 0, s: 0, l: 100 } satisfies HslChannels,
      foreground: { h: 222, s: 47, l: 11 } satisfies HslChannels,
      muted: { h: 210, s: 40, l: 96 } satisfies HslChannels,
      /* l:47 dava 4.29:1 sobre `muted` (avatar, figcaption de código) — abaixo de AA. */
      mutedForeground: { h: 215, s: 16, l: 44 } satisfies HslChannels,
      border: { h: 214, s: 32, l: 91 } satisfies HslChannels,
      ring: { h: 222, s: 84, l: 5 } satisfies HslChannels,
      primary: { h: 222, s: 47, l: 11 } satisfies HslChannels,
      primaryForeground: { h: 210, s: 40, l: 98 } satisfies HslChannels,
      accent: { h: 210, s: 40, l: 96 } satisfies HslChannels,
      accentForeground: { h: 222, s: 47, l: 11 } satisfies HslChannels,
      destructive: { h: 0, s: 72, l: 51 } satisfies HslChannels,
      destructiveForeground: { h: 0, s: 0, l: 100 } satisfies HslChannels,
    },
    dark: {
      background: { h: 224, s: 71, l: 4 } satisfies HslChannels,
      foreground: { h: 210, s: 40, l: 98 } satisfies HslChannels,
      muted: { h: 215, s: 28, l: 17 } satisfies HslChannels,
      mutedForeground: { h: 217, s: 10, l: 64 } satisfies HslChannels,
      border: { h: 215, s: 28, l: 17 } satisfies HslChannels,
      ring: { h: 212, s: 100, l: 48 } satisfies HslChannels,
      primary: { h: 210, s: 40, l: 98 } satisfies HslChannels,
      primaryForeground: { h: 222, s: 47, l: 11 } satisfies HslChannels,
      accent: { h: 215, s: 28, l: 17 } satisfies HslChannels,
      accentForeground: { h: 210, s: 40, l: 98 } satisfies HslChannels,
      destructive: { h: 0, s: 63, l: 31 } satisfies HslChannels,
      destructiveForeground: { h: 210, s: 40, l: 98 } satisfies HslChannels,
    },
  },
  fonts: {
    sans: {
      variable: "--font-sans",
      /** Alinhado a `globals.css` / next/font: `--font-inter` + system stack */
      fallback: "ui-sans-serif, system-ui, sans-serif",
    },
    mono: {
      variable: "--font-mono",
      /** Alinhado a `--font-roboto-mono` (layout.tsx) */
      fallback: "ui-monospace, SFMono-Regular, monospace",
    },
  },
  radii: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    full: "9999px",
  },
} as const;

export type ThemeColorScheme = keyof typeof themeConfig.colors;

export function hslToChannelsString(channels: HslChannels): string {
  return `${channels.h} ${channels.s}% ${channels.l}%`;
}

/** Optional RGB helper for non-Tailwind contexts (e.g. canvas, third-party). */
export function hslToRgbApprox(channels: HslChannels): RgbChannels {
  const { h, s, l } = channels;
  const s1 = s / 100;
  const l1 = l / 100;
  const c = (1 - Math.abs(2 * l1 - 1)) * s1;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l1 - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function rgbToString(rgb: RgbChannels): string {
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

/**
 * Emits CSS custom properties em `html` / `html.dark`.
 * Importante: este bloco é injetado no **final do body** (layout) para ficar **depois** do
 * bundle do Tailwind (`@theme`); caso contrário as utilities `bg-background` etc. não
 * herdam as paletas corretas no modo escuro.
 *
 * `@media (prefers-color-scheme: dark)` em `html:not([data-theme])` só aplica sem cookie:
 * com cookie, o `layout.tsx` define `data-theme="light"|"dark"` no `<html>` para não
 * sobrepor a escolha do utilizador ao `prefers-color-scheme`.
 */
export function buildThemeCssVariables(): string {
  const { light, dark } = themeConfig.colors;
  const lightEntries = Object.entries(light).map(
    ([key, value]) => `--palette-${toKebab(key)}: ${hslToChannelsString(value)};`,
  );
  const darkEntries = Object.entries(dark).map(
    ([key, value]) => `--palette-${toKebab(key)}: ${hslToChannelsString(value)};`,
  );

  const radii = `--radius-sm: ${themeConfig.radii.sm};
  --radius-md: ${themeConfig.radii.md};
  --radius-lg: ${themeConfig.radii.lg};
  --radius-full: ${themeConfig.radii.full};`;

  return `html {
  color-scheme: light;
  ${lightEntries.join("\n  ")}
  ${radii}
}
html.dark,
html[data-theme="dark"] {
  color-scheme: dark;
  ${darkEntries.join("\n  ")}
}
@media (prefers-color-scheme: dark) {
  html:not([data-theme]) {
    color-scheme: dark;
    ${darkEntries.join("\n  ")}
  }
}`;
}

function toKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
