/**
 * Campos do bloco DatoCMS `logo_grid`. API keys snake_case; CDA expõe camelCase.
 *
 * | Campo         | API key       | Default                          |
 * |---------------|---------------|----------------------------------|
 * | Title         | title         | — (opcional)                     |
 * | Subtitle      | subtitle      | — (opcional)                     |
 * | Logos         | logos         | — (≥1 ImageBlock no CMS)         |
 * | Grayscale     | grayscale     | false                            |
 * | Layout style  | layout_style  | grid (grid \| marquee)           |
 *
 * Select values: `grid` | `marquee`. O CMS pode gravar o label (`GRID`) — normalizamos.
 */

export type LogoGridLayoutStyle = "grid" | "marquee";

export type LogoGridOptions = {
  layoutStyle: LogoGridLayoutStyle;
  grayscale: boolean;
};

export const LOGO_GRID_DEFAULTS: LogoGridOptions = {
  layoutStyle: "grid",
  grayscale: false,
};

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

function parseLayoutStyle(raw: string): LogoGridLayoutStyle {
  const v = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (v === "marquee" || v.includes("marquee") || v.includes("carousel") || v.includes("carrossel")) {
    return "marquee";
  }
  return "grid";
}

/** Resolve layout + grayscale a partir do record CDA. */
export function resolveLogoGridOptions(record: Record<string, unknown>): LogoGridOptions {
  const layoutRaw = readOptionalString(record, "layoutStyle", "layout_style");
  const grayscale = readOptionalBool(record, "grayscale", "grayscale");

  return {
    layoutStyle: layoutRaw ? parseLayoutStyle(layoutRaw) : LOGO_GRID_DEFAULTS.layoutStyle,
    grayscale: grayscale ?? LOGO_GRID_DEFAULTS.grayscale,
  };
}
