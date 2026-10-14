import { stripStega } from "react-datocms/stega";

/**
 * Primitives to overlay CMS strings on the built-in copy (`*-copy.ts`).
 * The CMS value wins only when it is a non-empty string; everything else keeps the code default.
 */

/** Trimmed text without Content Link (stega) metadata; `null` when empty or not a string. */
export function cleanOverride(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = stripStega(value).trim();
  return text || null;
}

/**
 * Reads the non-empty CMS value for each copy key.
 * `fields` maps a copy key to its CDA field name; `source` is the raw CDA record.
 */
export function pickOverrides<K extends string>(
  fields: Record<K, string>,
  source: Readonly<Record<string, unknown>> | null | undefined,
): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  if (!source) return out;
  for (const key of Object.keys(fields) as K[]) {
    const value = cleanOverride(source[fields[key]]);
    if (value) out[key] = value;
  }
  return out;
}

/** Replaces `{name}` placeholders. Unknown placeholders stay untouched so typos are visible. */
export function interpolate(template: string, vars: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  );
}

/** Singular when `count === 1`, plural otherwise; both can use `{count}`. */
export function pluralTemplate(one: string, other: string, count: number): string {
  return interpolate(count === 1 ? one : other, { count });
}
