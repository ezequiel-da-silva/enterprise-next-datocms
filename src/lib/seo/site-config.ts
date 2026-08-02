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

/** Caminho da busca interna (SearchAction / AEO). */
export function getSearchPath(): string {
  return "/busca";
}
