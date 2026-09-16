import { resolveAdminAccessToken } from "@/lib/shopify/admin-access-token";
import {
  DATO_ES_SHOPIFY_CANDIDATES,
  DATO_PT_SHOPIFY_CANDIDATES,
  pickShopifyLocale,
  translationValue,
} from "@/lib/shopify/locale-map";

/** Alinhado com `shopify.app.toml` `[webhooks] api_version`. */
export const SHOPIFY_ADMIN_API_VERSION = "2026-07";

export type ShopifyProductTitles = {
  en: string;
  ptBR?: string | null;
  es?: string | null;
};

export type PushProductTitleResult =
  | { ok: true; skipped: boolean; warnings: string[] }
  | { ok: false; reason: "not_configured"; missing: string[] }
  | { ok: false; reason: "transport_error" | "shopify_error"; detail?: string };

export type ShopifyTitleTranslations = {
  pt: string | null;
  es: string | null;
};

function productGid(id: string): string {
  if (id.startsWith("gid://shopify/Product/")) return id;
  return `gid://shopify/Product/${id}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

type AdminGraphqlResult = {
  ok: boolean;
  json: unknown;
  /** Erros de topo do GraphQL (ex.: `Access denied … read_translations`). */
  errors: string[];
};

function readGraphqlErrors(json: unknown): string[] {
  const rows = asRecord(json)?.errors;
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const message = asRecord(row)?.message;
      return typeof message === "string" ? message.trim() : "";
    })
    .filter(Boolean);
}

function readUserErrors(payload: Record<string, unknown> | null): string[] {
  const rows = payload?.userErrors;
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const message = asRecord(row)?.message;
      return typeof message === "string" ? message.trim() : "";
    })
    .filter(Boolean);
}

async function adminGraphql(
  domain: string,
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<AdminGraphqlResult> {
  const response = await fetch(`https://${domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json: unknown = await response.json().catch(() => null);
  return { ok: response.ok, json, errors: readGraphqlErrors(json) };
}

/** Título default (Market US). Só precisa de `read_products`. */
const PRODUCT_TITLE_QUERY = /* GraphQL */ `
  query ProductTitle($id: ID!) {
    product(id: $id) {
      id
      title
    }
  }
`;

/**
 * Traduções + locales publicados. Exige `read_translations` (+ `read_locales`
 * para `shopLocales`); sem esses scopes o `data` vem nulo e só o EN sincroniza.
 */
const PRODUCT_I18N_QUERY = /* GraphQL */ `
  query ProductTitleI18n($id: ID!) {
    shopLocales {
      locale
      published
    }
    translatableResource(resourceId: $id) {
      translatableContent {
        key
        value
        digest
        locale
      }
      pt: translations(locale: "pt") {
        key
        value
        locale
      }
      ptBR: translations(locale: "pt-BR") {
        key
        value
        locale
      }
      es: translations(locale: "es") {
        key
        value
        locale
      }
      esES: translations(locale: "es-ES") {
        key
        value
        locale
      }
    }
  }
`;

const PRODUCT_UPDATE_MUTATION = /* GraphQL */ `
  mutation ProductUpdateTitle($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const TRANSLATIONS_REGISTER = /* GraphQL */ `
  mutation RegisterProductTitle($resourceId: ID!, $translations: [TranslationInput!]!) {
    translationsRegister(resourceId: $resourceId, translations: $translations) {
      translations {
        key
        locale
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Mensagem de erro Shopify: fica no log (também em produção) porque diz o scope em falta. */
function logAdminFailure(message: string, detail?: string): void {
  console.error(detail ? `${message}: ${detail}` : message);
}

function translationRows(value: unknown): Array<{ key?: string; value?: string | null }> {
  return Array.isArray(value) ? (value as Array<{ key?: string; value?: string | null }>) : [];
}

function shopLocaleCodes(data: Record<string, unknown> | null): string[] {
  const rows = data?.shopLocales;
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const record = asRecord(row);
      const locale = typeof record?.locale === "string" ? record.locale.trim() : "";
      const published = record?.published !== false;
      return published ? locale : "";
    })
    .filter(Boolean);
}

function titleDigest(resource: Record<string, unknown> | null): string | null {
  const content = resource?.translatableContent;
  if (!Array.isArray(content)) return null;
  const title = content.find((entry) => asRecord(entry)?.key === "title");
  const digest = asRecord(title)?.digest;
  return typeof digest === "string" && digest.trim() ? digest.trim() : null;
}

function readTranslations(resource: Record<string, unknown> | null): ShopifyTitleTranslations {
  return {
    pt: translationValue(translationRows(resource?.ptBR)) ?? translationValue(translationRows(resource?.pt)),
    es: translationValue(translationRows(resource?.es)) ?? translationValue(translationRows(resource?.esES)),
  };
}

/**
 * Traduções Shopify do título (Markets PT/ES) para o CMA Dato `pt-BR` / `es`.
 * Sem credenciais ou sem `read_translations` → vazio (o EN continua a sincronizar).
 */
export async function readShopifyProductTranslations(shopifyProductId: string): Promise<ShopifyTitleTranslations> {
  const empty: ShopifyTitleTranslations = { pt: null, es: null };
  const auth = await resolveAdminAccessToken();
  if (!auth.ok) return empty;

  try {
    const read = await adminGraphql(auth.domain, auth.token, PRODUCT_I18N_QUERY, {
      id: productGid(shopifyProductId),
    });
    if (read.errors.length > 0) {
      logAdminFailure("[readShopifyProductTranslations] Shopify rejected the i18n query", read.errors.join("; "));
    }
    const data = asRecord(asRecord(read.json)?.data);
    return readTranslations(asRecord(data?.translatableResource));
  } catch (err) {
    logAdminFailure("[readShopifyProductTranslations] failed", String(err));
    return empty;
  }
}

/**
 * Empurra títulos Dato → Shopify: `en` no produto; `pt-BR`/`es` via translationsRegister.
 * Skip por campo se já for igual (corta o eco dos webhooks). PT/ES em falha não
 * invalidam o EN — devolvem `warnings` (o webhook Dato não fica a repetir).
 */
export async function pushShopifyProductTitle(
  shopifyProductId: string,
  titles: ShopifyProductTitles,
): Promise<PushProductTitleResult> {
  const auth = await resolveAdminAccessToken();
  if (!auth.ok) {
    if (auth.reason === "not_configured") {
      return { ok: false, reason: "not_configured", missing: auth.missing };
    }
    return { ok: false, reason: "shopify_error", detail: "Admin OAuth failed" };
  }

  const id = productGid(shopifyProductId);
  const titleEn = titles.en.trim();
  if (!titleEn) return { ok: false, reason: "shopify_error", detail: "Empty en title" };

  const nextPt = titles.ptBR?.trim() ?? "";
  const nextEs = titles.es?.trim() ?? "";
  const warnings: string[] = [];

  try {
    const read = await adminGraphql(auth.domain, auth.token, PRODUCT_TITLE_QUERY, { id });
    const product = asRecord(asRecord(asRecord(read.json)?.data)?.product);
    /** `null` = título atual desconhecido → escreve para não perder a edição. */
    const currentEn = typeof product?.title === "string" ? product.title.trim() : null;
    if (read.errors.length > 0) {
      logAdminFailure("[pushShopifyProductTitle] product read failed", read.errors.join("; "));
    }

    let wrote = false;

    if (currentEn !== titleEn) {
      const write = await adminGraphql(auth.domain, auth.token, PRODUCT_UPDATE_MUTATION, {
        product: { id, title: titleEn },
      });
      const payload = asRecord(asRecord(asRecord(write.json)?.data)?.productUpdate);
      const problems = [...write.errors, ...readUserErrors(payload)];
      if (!write.ok || problems.length > 0 || !asRecord(payload?.product)) {
        const detail = problems.join("; ") || `HTTP ${write.ok ? 200 : "error"} without productUpdate payload`;
        logAdminFailure("[pushShopifyProductTitle] productUpdate failed", detail);
        return { ok: false, reason: "shopify_error", detail };
      }
      wrote = true;
    }

    if (!nextPt && !nextEs) {
      return { ok: true, skipped: !wrote, warnings };
    }

    const i18n = await adminGraphql(auth.domain, auth.token, PRODUCT_I18N_QUERY, { id });
    const i18nData = asRecord(asRecord(i18n.json)?.data);
    const resource = asRecord(i18nData?.translatableResource);
    const digest = titleDigest(resource);
    if (!digest) {
      const detail =
        i18n.errors.join("; ") || "translatableResource without a title digest (produto sem traduções?)";
      logAdminFailure("[pushShopifyProductTitle] translations unavailable", detail);
      warnings.push(`translations skipped: ${detail}`);
      return { ok: true, skipped: !wrote, warnings };
    }

    const locales = shopLocaleCodes(i18nData);
    const current = readTranslations(resource);
    const ptLocale = pickShopifyLocale(locales, DATO_PT_SHOPIFY_CANDIDATES);
    const esLocale = pickShopifyLocale(locales, DATO_ES_SHOPIFY_CANDIDATES);
    const translations: Array<{
      key: string;
      locale: string;
      value: string;
      translatableContentDigest: string;
    }> = [];

    if (ptLocale && nextPt && nextPt !== (current.pt ?? "")) {
      translations.push({ key: "title", locale: ptLocale, value: nextPt, translatableContentDigest: digest });
    }
    if (esLocale && nextEs && nextEs !== (current.es ?? "")) {
      translations.push({ key: "title", locale: esLocale, value: nextEs, translatableContentDigest: digest });
    }

    if (translations.length > 0) {
      const register = await adminGraphql(auth.domain, auth.token, TRANSLATIONS_REGISTER, {
        resourceId: id,
        translations,
      });
      const payload = asRecord(asRecord(asRecord(register.json)?.data)?.translationsRegister);
      const problems = [...register.errors, ...readUserErrors(payload)];
      if (!register.ok || problems.length > 0) {
        const detail = problems.join("; ") || "translationsRegister without payload";
        logAdminFailure("[pushShopifyProductTitle] translationsRegister failed", detail);
        warnings.push(`translations failed: ${detail}`);
        return { ok: true, skipped: !wrote, warnings };
      }
      wrote = true;
    }

    return { ok: true, skipped: !wrote, warnings };
  } catch (err) {
    logAdminFailure("[pushShopifyProductTitle] Admin GraphQL failed", String(err));
    return { ok: false, reason: "transport_error" };
  }
}
