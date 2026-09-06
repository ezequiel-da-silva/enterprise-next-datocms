/**
 * Campos do bloco DatoCMS `feature_grid`. API keys snake_case; CDA expõe camelCase.
 *
 * | Campo             | API key           | Default (advanced_options=false) |
 * |-------------------|-------------------|----------------------------------|
 * | Variante          | variant           | cards                            |
 * | Carrossel         | carousel_options  | defaults de `carousel_setting`   |
 * | ID da secção      | section_id        | —                                |
 *
 * Autoplay só aplica com `advanced_options`. Sem `loop`, o autoplay pára no último
 * snap (não volta ao início à revelia do toggle Loop).
 */
import { readCdaStringForLogic } from "@/lib/datocms/cda-field";
import {
  CAROUSEL_SETTING_DEFAULTS,
  resolveCarouselSetting,
  type CarouselSetting,
} from "@/lib/datocms/resolve-carousel-setting";

export type FeatureGridVariant = "cards" | "full_bleed";

export type FeatureGridOptions = {
  variant: FeatureGridVariant;
  carousel: CarouselSetting;
  sectionId?: string;
};

export const FEATURE_GRID_DEFAULTS: FeatureGridOptions = {
  variant: "cards",
  carousel: CAROUSEL_SETTING_DEFAULTS,
};

function readOptionalBool(record: Record<string, unknown>, camel: string, snake: string): boolean | undefined {
  const raw = record[camel] ?? record[snake];
  if (raw === true) return true;
  if (raw === false) return false;
  return undefined;
}

function readOptionalString(record: Record<string, unknown>, camel: string, snake: string): string | undefined {
  return readCdaStringForLogic(record, camel, snake) || undefined;
}

function parseVariant(raw: string): FeatureGridVariant {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "full_bleed" || value.includes("full") || value.includes("sangria")) {
    return "full_bleed";
  }
  return "cards";
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
    return { ...FEATURE_GRID_DEFAULTS, carousel: { ...CAROUSEL_SETTING_DEFAULTS }, variant };
  }

  return {
    variant,
    carousel: resolveCarouselSetting(record.carouselOptions ?? record.carousel_options),
    sectionId: sanitizeSectionId(readOptionalString(record, "sectionId", "section_id")),
  };
}
