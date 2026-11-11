export type SizeChartRow = {
  length: number;
  riderWeightKg: string;
  waistWidthMm: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function wholeNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function weightBand(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function parseRow(value: unknown): SizeChartRow | null {
  const row = asRecord(value);
  if (!row) return null;
  const length = wholeNumber(row.length);
  const riderWeightKg = weightBand(row.riderWeightKg);
  const waistWidthMm = wholeNumber(row.waistWidthMm);
  if (length === null || riderWeightKg === null || waistWidthMm === null) return null;
  return { length, riderWeightKg, waistWidthMm };
}

/**
 * `size_chart` is a Dato JSON field. The CDA may return an array or a JSON string.
 * Rows missing length, weight or waist are dropped. An invalid payload yields `[]`.
 */
export function parseSizeChart(value: unknown): SizeChartRow[] {
  let source = value;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(source)) return [];
  return source.flatMap((row) => {
    const parsed = parseRow(row);
    return parsed ? [parsed] : [];
  });
}
