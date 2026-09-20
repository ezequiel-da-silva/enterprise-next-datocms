/**
 * Paths that still need the proxy (CSP / nonce / locale headers) but must not
 * spend a CDA call on CMS redirects.
 */
const SKIP_EXACT = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/manifest.json",
  "/llms.txt",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
]);

/**
 * CMS redirects apply to document URLs, not metadata/icon routes or APIs.
 * The proxy still runs on these paths so security headers stay on every response.
 */
export function shouldLookupCmsRedirects(pathname: string): boolean {
  if (!pathname || pathname === "/") return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next/")) return false;
  if (SKIP_EXACT.has(pathname)) return false;
  return true;
}
