/** Shopify `body_html` ↔ texto simples no Dato (`description`). Negrito/listas da Admin achatam-se. */

const BLOCK_BREAK = /<\/(p|div|h[1-6]|li|tr)>/gi;

export function shopifyHtmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(BLOCK_BREAK, "\n\n")
    .replace(/<[^>]+>/g, "");
  return decodeBasicEntities(withBreaks).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function plainTextToShopifyHtml(text: string | null | undefined): string {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return "";
  return trimmed
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}
