import { buildRequestHeaders } from "@datocms/cda-client";

const DEFAULT_GRAPHQL_URL = "https://graphql.datocms.com/";

/**
 * Leitura em runtime com `process.env['KEY']` + trim — evita edge cases de cache/inlining
 * e valores só com espaços (ficam como "ausentes").
 */
function readEnv(name: "DATOCMS_API_TOKEN" | "DATOCMS_DRAFT_CDA_TOKEN"): string | undefined {
  const raw = process.env[name];
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const trimmed = String(raw).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export type DatocmsRequestOptions = {
  query: string;
  variables?: Record<string, unknown>;
  /** Next.js cache tags para `revalidateTag` (ignorado com rascunhos / no-store). */
  tags?: string[];
  /** Segundos para ISR; `false` desativa revalidação temporal. */
  revalidate?: number | false;
  /**
   * Quando `true`: usa **apenas** `DATOCMS_DRAFT_CDA_TOKEN` e envia `X-Include-Drafts: true`
   * (via `buildRequestHeaders` do `@datocms/cda-client`).
   */
  includeDrafts?: boolean;
  /** Visual Editing / Content Link — em conjunto com `baseEditingUrl`. */
  contentLink?: "v1" | "vercel-v1";
  /** Ex.: `https://boilerplate-dato.admin.datocms.com` */
  baseEditingUrl?: string;
  /** Força `cache: 'no-store'` (ex.: draft mode). */
  cache?: RequestCache;
};

export type DatocmsResponse<T> = { data: T } | { errors: { message: string }[] };

function resolveGraphqlUrl(includeDrafts: boolean): string {
  const previewUrl = process.env["DATOCMS_PREVIEW_GRAPHQL_URL"]?.trim();
  if (includeDrafts && previewUrl) {
    return previewUrl;
  }
  return process.env["DATOCMS_GRAPHQL_URL"]?.trim() ?? DEFAULT_GRAPHQL_URL;
}

function resolveToken(includeDrafts: boolean): string | undefined {
  if (includeDrafts) {
    return readEnv("DATOCMS_DRAFT_CDA_TOKEN");
  }
  return readEnv("DATOCMS_API_TOKEN");
}

export async function datocmsFetch<T>(
  options: DatocmsRequestOptions,
): Promise<DatocmsResponse<T>> {
  const {
    query,
    variables,
    tags,
    revalidate,
    includeDrafts = false,
    contentLink,
    baseEditingUrl,
    cache: cacheOverride,
  } = options;

  const token = resolveToken(includeDrafts);
  if (!token) {
    if (includeDrafts) {
      return { errors: [{ message: "Missing DATOCMS_DRAFT_CDA_TOKEN for draft requests" }] };
    }
    return { errors: [{ message: "Missing DATOCMS_API_TOKEN" }] };
  }

  const url = resolveGraphqlUrl(includeDrafts);
  const bypassCache = Boolean(includeDrafts || cacheOverride === "no-store");
  const nextCache = bypassCache
    ? undefined
    : {
        tags,
        revalidate: revalidate === false ? undefined : (revalidate ?? 300),
      };

  const baseHeaders = buildRequestHeaders({
    token,
    includeDrafts,
    environment: process.env["DATOCMS_ENVIRONMENT"]?.trim(),
    contentLink: includeDrafts ? contentLink : undefined,
    baseEditingUrl: includeDrafts ? baseEditingUrl : undefined,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...baseHeaders,
      "Content-Type": "application/json",
      /** Garantia explícita (além do `buildRequestHeaders`): `Bearer <token>`. */
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: bypassCache ? "no-store" : (cacheOverride ?? "default"),
    next: nextCache,
  });

  if (!res.ok) {
    return {
      errors: [{ message: `DatoCMS HTTP ${res.status}: ${await res.text()}` }],
    };
  }

  const body = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    return { errors: body.errors };
  }

  if (body.data === undefined || body.data === null) {
    return { errors: [{ message: "DatoCMS: resposta sem campo data" }] };
  }

  return { data: body.data };
}
