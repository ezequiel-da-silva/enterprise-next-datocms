/** Extrai texto plano de um valor Structured Text / DAST do DatoCMS. */
export function dastPlainText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();

  const root =
    value && typeof value === "object" && "document" in value
      ? (value as { document?: unknown }).document
      : value;

  if (!root || typeof root !== "object") return "";

  const parts: string[] = [];
  collectDastText(root, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function collectDastText(node: unknown, parts: string[]): void {
  if (node == null || typeof node !== "object") return;

  const n = node as Record<string, unknown>;

  if (n.type === "span" && typeof n.value === "string" && n.value.trim() !== "") {
    parts.push(n.value.trim());
    return;
  }

  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      collectDastText(child, parts);
    }
  }
}
