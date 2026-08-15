/**
 * Paths estáveis para Lighthouse CI + smoke HTTP 200.
 * Única fonte de verdade — smoke (workflow) e lighthouserc.cjs leem daqui.
 *
 * Override opcional: LHCI_PATHS="/en,/en/about" (lista separada por vírgulas).
 * Base: LHCI_BASE_URL (default http://127.0.0.1:3000).
 */
const DEFAULT_PATHS = ["/en", "/en/page-two"];

function parsePathsFromEnv(raw) {
  if (!raw || typeof raw !== "string") return null;
  const paths = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith("/") ? p : `/${p}`));
  return paths.length > 0 ? paths : null;
}

const paths = parsePathsFromEnv(process.env.LHCI_PATHS) ?? DEFAULT_PATHS;
const baseUrl = (process.env.LHCI_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

module.exports = {
  paths,
  baseUrl,
  urls: paths.map((path) => `${baseUrl}${path}`),
};
