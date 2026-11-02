const LOCAL_SITE_URL = "http://localhost:3000";

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function vercelProductionHost(): string | undefined {
  const raw = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** `localhost` e `127.0.0.1` não servem de canonical em produção. */
function isLoopbackUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

/**
 * URL pública do site, sem barra final.
 * `NEXT_PUBLIC_SITE_URL` ganha quando é um host público. Na Vercel, loopback ou
 * variável vazia caem em `VERCEL_PROJECT_PRODUCTION_URL` para canonical, sitemap e JSON-LD.
 */
export function getSiteBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && !isLoopbackUrl(configured)) {
    return stripTrailingSlash(configured);
  }

  const productionHost = vercelProductionHost();
  if (productionHost && !isLoopbackUrl(`https://${productionHost}`)) {
    return `https://${productionHost}`;
  }

  return configured ? stripTrailingSlash(configured) : LOCAL_SITE_URL;
}

export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "next-dato";
}

export function getOrganizationName(): string {
  return process.env.NEXT_PUBLIC_ORGANIZATION_NAME?.trim() || getSiteName();
}

/** `@id` do nó Organization no JSON-LD global (`buildSiteJsonLdGraph`). */
export function getOrganizationId(): string {
  return `${getSiteBaseUrl()}/#organization`;
}

/**
 * Imagem OG por omissão (1200×630). Usada quando o campo SEO / hero / cover está vazio.
 * Preferir `NEXT_PUBLIC_DEFAULT_OG_IMAGE`; senão o logo da organização.
 */
export function getDefaultOpenGraphImage(): string | undefined {
  const dedicated = process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE?.trim();
  if (dedicated) return dedicated;
  const logo = process.env.NEXT_PUBLIC_ORGANIZATION_LOGO_URL?.trim();
  return logo || undefined;
}

/** Caminho da busca interna quando Global setting ainda não aponta para uma Page. */
export function getSearchPath(): string {
  return "/busca";
}
