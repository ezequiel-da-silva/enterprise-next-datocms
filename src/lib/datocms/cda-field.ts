import { stripStega } from "react-datocms/stega";

type RecordLike = Record<string, unknown>;

/** Lê campo camelCase ou snake_case legado vindo do CDA / JSON antigo. */
export function readCdaString(record: RecordLike, camel: string, snake: string): string {
  const raw = record[camel] ?? record[snake];
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * Lê texto usado como configuração/chave, removendo metadados invisíveis do Content Link.
 * Para copy renderizada, use `readCdaString()` para preservar o click-to-edit.
 */
export function readCdaStringForLogic(record: RecordLike, camel: string, snake: string): string {
  return stripStega(readCdaString(record, camel, snake));
}

/** Lê boolean camelCase ou snake_case legado. */
export function readCdaBool(record: RecordLike, camel: string, snake: string): boolean {
  const raw = record[camel] ?? record[snake];
  return raw === true;
}

/** Lê object aninhado camelCase ou snake_case legado. Listas não contam (ver `readCdaBlock`). */
export function readCdaObject<T>(record: RecordLike, camel: string, snake: string): T | null {
  const raw = record[camel] ?? record[snake];
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as T;
}

/**
 * Lê um bloco aninhado que o Dato pode expor como *single block* (objeto) ou como
 * *modular content* limitado a 1 item (array) — o mesmo campo muda de forma no CDA
 * conforme o tipo escolhido no schema, por isso aceitamos ambos.
 */
export function readCdaBlock<T>(record: RecordLike, camel: string, snake: string): T | null {
  const raw = record[camel] ?? record[snake];
  if (Array.isArray(raw)) {
    const first = raw.find((item) => item != null && typeof item === "object" && !Array.isArray(item));
    return (first as T | undefined) ?? null;
  }
  if (raw == null || typeof raw !== "object") return null;
  return raw as T;
}

/** Lê array camelCase ou snake_case legado. */
export function readCdaArray<T>(record: RecordLike, camel: string, snake: string): T[] {
  const raw = record[camel] ?? record[snake];
  return Array.isArray(raw) ? (raw as T[]) : [];
}
