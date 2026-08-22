/** URL pública do site (sem barra final). */
export function getSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
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

/** Caminho da busca interna (SearchAction / AEO). */
export function getSearchPath(): string {
  return "/busca";
}
