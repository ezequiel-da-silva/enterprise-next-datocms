/**
 * Campos do bloco DatoCMS `cta_banner`. API keys snake_case; CDA expõe camelCase.
 *
 * | Campo                    | API key           | Default (advanced_options=false) |
 * |--------------------------|-------------------|------------------------------------|
 * | Opções avançadas         | advanced_options  | — usa defaults abaixo              |
 * | Variant                  | variant           | centered                           |
 * | Background theme         | bg_theme          | primary                            |
 */
import { readCdaStringForLogic } from "@/lib/datocms/cda-field";

export type CtaBannerVariant = "centered" | "split" | "card_inset";
export type CtaBannerBgTheme = "primary" | "muted" | "transparent";

export type CtaBannerOptions = {
  variant: CtaBannerVariant;
  bgTheme: CtaBannerBgTheme;
};

export const CTA_BANNER_DEFAULTS: CtaBannerOptions = {
  variant: "centered",
  bgTheme: "primary",
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

function isAdvancedOptionsEnabled(record: Record<string, unknown>): boolean {
  return readOptionalBool(record, "advancedOptions", "advanced_options") === true;
}

function parseVariant(raw: string): CtaBannerVariant {
  const v = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (v === "split" || v.includes("split") || v.includes("divid")) return "split";
  if (v === "card_inset" || v.includes("card") || v.includes("inset")) return "card_inset";
  if (v === "centered" || v.includes("central")) return "centered";
  return "centered";
}

function parseBgTheme(raw: string): CtaBannerBgTheme {
  const v = raw.trim().toLowerCase();
  if (v === "muted" || v.includes("muted") || v.includes("neutro")) return "muted";
  if (v === "transparent" || v.includes("transparent") || v.includes("transparen")) return "transparent";
  return "primary";
}

/** Resolve variant e tema: defaults globais ou campos CMS com opções avançadas ativas. */
export function resolveCtaBannerOptions(record: Record<string, unknown>): CtaBannerOptions {
  // 1. Variant é LIDA SEMPRE (pois o campo está sempre visível no CMS)
  const variantRaw = readOptionalString(record, "variant", "variant");

  // 2. Background Theme depende do switch advanced_options
  const isAdvanced = isAdvancedOptionsEnabled(record);
  const bgThemeRaw = isAdvanced ? readOptionalString(record, "bgTheme", "bg_theme") : undefined;

  return {
    variant: variantRaw ? parseVariant(variantRaw) : CTA_BANNER_DEFAULTS.variant,
    bgTheme: bgThemeRaw ? parseBgTheme(bgThemeRaw) : CTA_BANNER_DEFAULTS.bgTheme,
  };
}
