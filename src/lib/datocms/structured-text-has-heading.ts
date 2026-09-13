type DastNode = {
  type?: string;
  level?: number;
  children?: unknown[];
};

function walk(node: unknown, level: number): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as DastNode;
  if (n.type === "heading" && n.level === level) return true;
  if (!Array.isArray(n.children)) return false;
  return n.children.some((child) => walk(child, level));
}

/** True when Structured Text DAST contains a heading of the given level (e.g. h1). */
export function structuredTextHasHeadingLevel(
  data: { value?: unknown } | null | undefined,
  level: number,
): boolean {
  const value = data?.value;
  if (value && typeof value === "object" && "document" in value) {
    return walk((value as { document?: unknown }).document, level);
  }
  return walk(value, level);
}
