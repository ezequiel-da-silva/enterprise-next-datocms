/**
 * Only https URLs on the store domain, an optional custom checkout domain or `*.myshopify.com`
 * are rendered as the checkout link.
 */
export function safeCheckoutUrl(
  raw: string | null | undefined,
  allowedHosts: (string | null | undefined)[],
): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  const allowed = allowedHosts
    .map((h) => h?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
    .filter((h): h is string => Boolean(h));
  if (allowed.includes(host) || host.endsWith(".myshopify.com")) return url.toString();
  return null;
}
