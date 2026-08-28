/**
 * Campos do bloco DatoCMS `feature_grid`. API keys snake_case; CDA expõe camelCase.
 *
 * | Campo             | API key           | Default (advanced_options=false) |
 * |-------------------|-------------------|----------------------------------|
 * | Variante          | variant           | cards                            |
 * | Autoplay          | autoplay          | false                            |
 * | Intervalo (s)     | autoplay_interval | 5 (clamp 3–12)                   |
 * | Mostrar setas     | show_arrows       | true                             |
 * | Mostrar pontos    | show_dots         | true                             |
 * | Loop              | loop              | true                             |
 * | ID da secção      | section_id        | —                                |
 *
 * Autoplay só aplica com `advanced_options`. Sem `loop`, o autoplay pára no último
 * snap (não volta ao início à revelia do toggle Loop).
 */

export type FeatureGridVariant = "cards" | "full_bleed";

export type FeatureGridOptions = {
  variant: FeatureGridVariant;
  autoplay: boolean;
  autoplayInterval: number;
  showArrows: boolean;
  showDots: boolean;
  loop: boolean;
  sectionId?: string;
};

export const FEATURE_GRID_DEFAULTS: FeatureGridOptions = {
  variant: "cards",
  autoplay: false,
  autoplayInterval: 5,
  showArrows: true,
  showDots: true,
  loop: true,
};

const MIN_AUTOPLAY_INTERVAL = 3;
const MAX_AUTOPLAY_INTERVAL = 12;

function readOptionalBool(record: Record<string, unknown>, camel: string, snake: string): boolean | undefined {
  const raw = record[camel] ?? record[snake];
  if (raw === true) return true;
  if (raw === false) return false;
  return undefined;
}

function readOptionalString(record: Record<string, unknown>, camel: string, snake: string): string | undefined {
  const raw = record[camel] ?? record[snake];
  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : undefined;
}

function readOptionalNumber(record: Record<string, unknown>, camel: string, snake: string): number | undefined {
  const raw = record[camel] ?? record[snake];
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isFinite(value) ? value : undefined;
}

function parseVariant(raw: string): FeatureGridVariant {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "full_bleed" || value.includes("full") || value.includes("sangria")) {
    return "full_bleed";
  }
  return "cards";
}

function clampInterval(value: number | undefined): number {
  if (value == null) return FEATURE_GRID_DEFAULTS.autoplayInterval;
  return Math.min(MAX_AUTOPLAY_INTERVAL, Math.max(MIN_AUTOPLAY_INTERVAL, Math.round(value)));
}

function sanitizeSectionId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const slug = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || undefined;
}

export function resolveFeatureGridOptions(record: Record<string, unknown>): FeatureGridOptions {
  const variantRaw = readOptionalString(record, "variant", "variant");
  const variant = variantRaw ? parseVariant(variantRaw) : FEATURE_GRID_DEFAULTS.variant;
  const advanced = readOptionalBool(record, "advancedOptions", "advanced_options") === true;

  if (!advanced) {
    return { ...FEATURE_GRID_DEFAULTS, variant };
  }

  return {
    variant,
    autoplay: readOptionalBool(record, "autoplay", "autoplay") ?? FEATURE_GRID_DEFAULTS.autoplay,
    autoplayInterval: clampInterval(
      readOptionalNumber(record, "autoplayInterval", "autoplay_interval"),
    ),
    showArrows: readOptionalBool(record, "showArrows", "show_arrows") ?? FEATURE_GRID_DEFAULTS.showArrows,
    showDots: readOptionalBool(record, "showDots", "show_dots") ?? FEATURE_GRID_DEFAULTS.showDots,
    loop: readOptionalBool(record, "loop", "loop") ?? FEATURE_GRID_DEFAULTS.loop,
    sectionId: sanitizeSectionId(readOptionalString(record, "sectionId", "section_id")),
  };
}
