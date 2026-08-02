type RecordLike = Record<string, unknown>;

/** Lê campo camelCase ou snake_case legado vindo do CDA / JSON antigo. */
export function readCdaString(record: RecordLike, camel: string, snake: string): string {
  const raw = record[camel] ?? record[snake];
  return typeof raw === "string" ? raw.trim() : "";
}

/** Lê boolean camelCase ou snake_case legado. */
export function readCdaBool(record: RecordLike, camel: string, snake: string): boolean {
  const raw = record[camel] ?? record[snake];
  return raw === true;
}

/** Lê object aninhado camelCase ou snake_case legado. */
export function readCdaObject<T>(record: RecordLike, camel: string, snake: string): T | null {
  const raw = record[camel] ?? record[snake];
  if (raw == null || typeof raw !== "object") return null;
  return raw as T;
}

/** Lê array camelCase ou snake_case legado. */
export function readCdaArray<T>(record: RecordLike, camel: string, snake: string): T[] {
  const raw = record[camel] ?? record[snake];
  return Array.isArray(raw) ? (raw as T[]) : [];
}
