import type { AppLocale } from "@/constants/i18n";
import { snowboardEnumLabel } from "@/lib/i18n/pdp-copy";

/** Spec subset used for the above-the-fold eyebrow (matches PDP CMS fields). */
export type ProductSpecEyebrowValues = {
  profile: string | null;
  flex: number | null;
  terrain: string | null;
  riderLevel: string | null;
};

/**
 * One-line technical summary above the fold (profile · flex · terrain · rider).
 * Omits core material (too long). Returns null when no pieces exist.
 */
export function formatProductSpecEyebrow(
  locale: AppLocale,
  values: ProductSpecEyebrowValues,
): string | null {
  const parts: string[] = [];

  const profile = snowboardEnumLabel(locale, "profile", values.profile);
  if (profile) parts.push(profile);

  if (values.flex !== null && Number.isInteger(values.flex)) {
    parts.push(`${values.flex}/10`);
  }

  const terrain = snowboardEnumLabel(locale, "terrain", values.terrain);
  if (terrain) parts.push(terrain);

  const rider = snowboardEnumLabel(locale, "rider", values.riderLevel);
  if (rider) parts.push(rider);

  if (parts.length === 0) return null;
  return parts.join(" · ");
}
