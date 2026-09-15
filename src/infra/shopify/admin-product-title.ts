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
  | { ok: true; skipped: boolean }
  | { ok: false; reason: "not_configured"; missing: string[] }
  | { ok: false; reason: "transport_error" | "shopify_error" };

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
};

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
  return { ok: response.ok, json };
}

const PRODUCT_I18N_QUERY = /* GraphQL */ `
  query ProductTitleI18n($id: ID!) {
    product(id: $id) {
      id
      title
    }
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

function logAdminFailure(message: string, detail?: unknown): void {
  if (process.env.NODE_ENV !== "production" && detail) {
    console.error(message, detail);
    return;
  }
  console.error(message);
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

/**
 * Traduções Shopify do título (Markets PT/ES) para o CMA Dato `pt-BR` / `es`.
 * Sem credenciais Admin → vazio (o webhook Shopify → Dato ainda atualiza `en`).
 */
export async function readShopifyProductTranslations(shopifyProductId: string): Promise<ShopifyTitleTranslations> {
  const empty: ShopifyTitleTranslations = { pt: null, es: null };
  const auth = await resolveAdminAccessToken();
  if (!auth.ok) return empty;

  try {
    const read = await adminGraphql(auth.domain, auth.token, PRODUCT_I18N_QUERY, {
      id: productGid(shopifyProductId),
    });
    const data = asRecord(asRecord(read.json)?.data);
    const resource = asRecord(data?.translatableResource);
    return {
      pt: translationValue(translationRows(resource?.ptBR)) ?? translationValue(translationRows(resource?.pt)),
      es: translationValue(translationRows(resource?.es)) ?? translationValue(translationRows(resource?.esES)),
    };
  } catch (err) {
    logAdminFailure("[readShopifyProductTranslations] failed", err);
    return empty;
  }
}

/**
 * Empurra títulos Dato → Shopify: `en` no produto; `pt-BR`/`es` via translationsRegister.
 * Skip por campo se já for igual (corta o eco dos webhooks).
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
    return { ok: false, reason: "shopify_error" };
  }

  const id = productGid(shopifyProductId);
  const titleEn = titles.en.trim();
  if (!titleEn) return { ok: false, reason: "shopify_error" };

  try {
    const read = await adminGraphql(auth.domain, auth.token, PRODUCT_I18N_QUERY, { id });
    const data = asRecord(asRecord(read.json)?.data);
    const product = asRecord(data?.product);
    const currentEn = typeof product?.title === "string" ? product.title.trim() : "";
    const resource = asRecord(data?.translatableResource);
    const digest = titleDigest(resource);
    const locales = shopLocaleCodes(data);

    let wrote = false;

    if (!(read.ok && currentEn === titleEn)) {
      const write = await adminGraphql(auth.domain, auth.token, PRODUCT_UPDATE_MUTATION, {
        product: { id, title: titleEn },
      });
      const payload = asRecord(asRecord(asRecord(write.json)?.data)?.productUpdate);
      const errors = payload?.userErrors;
      if (
        !write.ok ||
        (Array.isArray(errors) && errors.length > 0) ||
        !asRecord(payload?.product)
      ) {
        logAdminFailure("[pushShopifyProductTitle] productUpdate failed", write.json);
        return { ok: false, reason: "shopify_error" };
      }
      wrote = true;
    }

    if (digest) {
      const translations: Array<{ key: string; locale: string; value: string; translatableContentDigest: string }> =
        [];
      const ptLocale = pickShopifyLocale(locales, DATO_PT_SHOPIFY_CANDIDATES);
      const esLocale = pickShopifyLocale(locales, DATO_ES_SHOPIFY_CANDIDATES);
      const currentPt =
        translationValue(translationRows(resource?.ptBR)) ?? translationValue(translationRows(resource?.pt));
      const currentEs =
        translationValue(translationRows(resource?.es)) ?? translationValue(translationRows(resource?.esES));
      const nextPt = titles.ptBR?.trim() || "";
      const nextEs = titles.es?.trim() || "";

      if (ptLocale && nextPt && nextPt !== (currentPt ?? "")) {
        translations.push({
          key: "title",
          locale: ptLocale,
          value: nextPt,
          translatableContentDigest: digest,
        });
      }
      if (esLocale && nextEs && nextEs !== (currentEs ?? "")) {
        translations.push({
          key: "title",
          locale: esLocale,
          value: nextEs,
          translatableContentDigest: digest,
        });
      }

      if (translations.length > 0) {
        const register = await adminGraphql(auth.domain, auth.token, TRANSLATIONS_REGISTER, {
          resourceId: id,
          translations,
        });
        const payload = asRecord(asRecord(asRecord(register.json)?.data)?.translationsRegister);
        const errors = payload?.userErrors;
        if (!register.ok || (Array.isArray(errors) && errors.length > 0)) {
          logAdminFailure("[pushShopifyProductTitle] translationsRegister failed", register.json);
          return { ok: false, reason: "shopify_error" };
        }
        wrote = true;
      }
    }

    return { ok: true, skipped: !wrote };
  } catch (err) {
    logAdminFailure("[pushShopifyProductTitle] Admin GraphQL failed", err);
    return { ok: false, reason: "transport_error" };
  }
}
