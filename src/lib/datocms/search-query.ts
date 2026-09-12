/** Termo `q` da query string (máx. 200 caracteres). */
export function readSearchQuery(raw?: string | string[] | null): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed.length > 200) return "";
  if (/[\n\r]/.test(trimmed)) return "";
  return trimmed;
}

export function searchResultsPath(canonicalPath: string, query?: string): string {
  const q = query?.trim();
  if (!q) return canonicalPath;
  return `${canonicalPath}?q=${encodeURIComponent(q)}`;
}
