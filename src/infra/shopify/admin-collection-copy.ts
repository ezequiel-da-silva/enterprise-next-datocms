import type {
  PushProductTitleResult,
  ShopifyCopyTranslations,
  ShopifyProductTitles,
} from "@/infra/shopify/admin-product-title";
import { resolveAdminAccessToken } from "@/lib/shopify/admin-access-token";
import {
  DATO_ES_SHOPIFY_CANDIDATES,
  DATO_PT_SHOPIFY_CANDIDATES,
  pickShopifyLocale,
  translationValue,
} from "@/lib/shopify/locale-map";
import { plainTextToShopifyHtml, shopifyHtmlToPlainText } from "@/lib/shopify/product-description-html";

export const SHOPIFY_ADMIN_API_VERSION = "2026-07";

const EMPTY_COPY: ShopifyCopyTranslations = {
  title: { pt: null, es: null },
  description: { pt: null, es: null },
};

function collectionGid(id: string): string {
  if (id.startsWith("gid://shopify/Collection/")) return id;
  return `gid://shopify/Collection/${id}`;
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

const COLLECTION_COPY_QUERY = /* GraphQL */ `
  query CollectionCopy($id: ID!) {
    collection(id: $id) {
      id
      title
      descriptionHtml
    }
  }
`;

const COLLECTION_I18N_QUERY = /* GraphQL */ `
  query CollectionCopyI18n($id: ID!) {
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

const COLLECTION_UPDATE_MUTATION = /* GraphQL */ `
  mutation CollectionUpdateCopy($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection {
        id
        title
        descriptionHtml
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const TRANSLATIONS_REGISTER = /* GraphQL */ `
  mutation RegisterCollectionCopy($resourceId: ID!, $translations: [TranslationInput!]!) {
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

function contentDigest(resource: Record<string, unknown> | null, key: string): string | null {
  const content = resource?.translatableContent;
  if (!Array.isArray(content)) return null;
  const entry = content.find((row) => asRecord(row)?.key === key);
  const digest = asRecord(entry)?.digest;
  return typeof digest === "string" && digest.trim() ? digest.trim() : null;
}

function readKeyedTranslations(
  resource: Record<string, unknown> | null,
  key: string,
): { pt: string | null; es: string | null } {
  const ptRaw =
    translationValue(translationRows(resource?.ptBR), key) ??
    translationValue(translationRows(resource?.pt), key);
  const esRaw =
    translationValue(translationRows(resource?.es), key) ??
    translationValue(translationRows(resource?.esES), key);
  const normalize = (raw: string | null): string | null => {
    if (!raw) return null;
    if (key !== "body_html") return raw;
    return shopifyHtmlToPlainText(raw) || null;
  };
  return { pt: normalize(ptRaw), es: normalize(esRaw) };
}

function readCopyTranslations(resource: Record<string, unknown> | null): ShopifyCopyTranslations {
  return {
    title: readKeyedTranslations(resource, "title"),
    description: readKeyedTranslations(resource, "body_html"),
  };
}

export async function readShopifyCollectionTranslations(
  shopifyCollectionId: string,
): Promise<ShopifyCopyTranslations> {
  const auth = await resolveAdminAccessToken();
  if (!auth.ok) return EMPTY_COPY;

  try {
    const read = await adminGraphql(auth.domain, auth.token, COLLECTION_I18N_QUERY, {
      id: collectionGid(shopifyCollectionId),
    });
    if (read.errors.length > 0) {
      logAdminFailure(
        "[readShopifyCollectionTranslations] Shopify rejected the i18n query",
        read.errors.join("; "),
      );
    }
    const data = asRecord(asRecord(read.json)?.data);
    return readCopyTranslations(asRecord(data?.translatableResource));
  } catch (err) {
    logAdminFailure("[readShopifyCollectionTranslations] failed", String(err));
    return EMPTY_COPY;
  }
}

export async function pushShopifyCollectionCopy(
  shopifyCollectionId: string,
  titles: ShopifyProductTitles,
): Promise<PushProductTitleResult> {
  const auth = await resolveAdminAccessToken();
  if (!auth.ok) {
    if (auth.reason === "not_configured") {
      return { ok: false, reason: "not_configured", missing: auth.missing };
    }
    return { ok: false, reason: "shopify_error", detail: "Admin OAuth failed" };
  }

  const id = collectionGid(shopifyCollectionId);
  const titleEn = titles.en.trim();
  if (!titleEn) return { ok: false, reason: "shopify_error", detail: "Empty en title" };

  const nextTitlePt = titles.ptBR?.trim() ?? "";
  const nextTitleEs = titles.es?.trim() ?? "";
  const nextDescEn = titles.descriptionEn?.trim() ?? "";
  const nextDescPt = titles.descriptionPt?.trim() ?? "";
  const nextDescEs = titles.descriptionEs?.trim() ?? "";
  const warnings: string[] = [];

  try {
    const read = await adminGraphql(auth.domain, auth.token, COLLECTION_COPY_QUERY, { id });
    const collection = asRecord(asRecord(asRecord(read.json)?.data)?.collection);
    const currentEn = typeof collection?.title === "string" ? collection.title.trim() : null;
    const currentDesc = shopifyHtmlToPlainText(
      typeof collection?.descriptionHtml === "string" ? collection.descriptionHtml : "",
    );
    if (read.errors.length > 0) {
      logAdminFailure("[pushShopifyCollectionCopy] collection read failed", read.errors.join("; "));
    }

    let wrote = false;
    const input: Record<string, string> = { id };
    if (currentEn !== titleEn) input.title = titleEn;
    if (nextDescEn && nextDescEn !== currentDesc) {
      input.descriptionHtml = plainTextToShopifyHtml(nextDescEn);
    }

    if (Object.keys(input).length > 1) {
      const write = await adminGraphql(auth.domain, auth.token, COLLECTION_UPDATE_MUTATION, { input });
      const payload = asRecord(asRecord(asRecord(write.json)?.data)?.collectionUpdate);
      const problems = [...write.errors, ...readUserErrors(payload)];
      if (!write.ok || problems.length > 0 || !asRecord(payload?.collection)) {
        const detail = problems.join("; ") || `HTTP ${write.ok ? 200 : "error"} without collectionUpdate payload`;
        logAdminFailure("[pushShopifyCollectionCopy] collectionUpdate failed", detail);
        return { ok: false, reason: "shopify_error", detail };
      }
      wrote = true;
    }

    const hasLocaleCopy = Boolean(nextTitlePt || nextTitleEs || nextDescPt || nextDescEs);
    if (!hasLocaleCopy) {
      return { ok: true, skipped: !wrote, warnings };
    }

    const i18n = await adminGraphql(auth.domain, auth.token, COLLECTION_I18N_QUERY, { id });
    const i18nData = asRecord(asRecord(i18n.json)?.data);
    const resource = asRecord(i18nData?.translatableResource);
    const titleDigest = contentDigest(resource, "title");
    const bodyDigest = contentDigest(resource, "body_html");
    if (!titleDigest && !bodyDigest) {
      const detail = i18n.errors.join("; ") || "translatableResource without title/body_html digest";
      logAdminFailure("[pushShopifyCollectionCopy] translations unavailable", detail);
      warnings.push(`translations skipped: ${detail}`);
      return { ok: true, skipped: !wrote, warnings };
    }

    const locales = shopLocaleCodes(i18nData);
    const current = readCopyTranslations(resource);
    const ptLocale = pickShopifyLocale(locales, DATO_PT_SHOPIFY_CANDIDATES);
    const esLocale = pickShopifyLocale(locales, DATO_ES_SHOPIFY_CANDIDATES);
    const translations: Array<{
      key: string;
      locale: string;
      value: string;
      translatableContentDigest: string;
    }> = [];

    const pushLocale = (
      locale: string | null,
      titleValue: string,
      descValue: string,
      currentTitle: string | null,
      currentDesc: string | null,
    ) => {
      if (!locale) return;
      if (titleDigest && titleValue && titleValue !== (currentTitle ?? "")) {
        translations.push({
          key: "title",
          locale,
          value: titleValue,
          translatableContentDigest: titleDigest,
        });
      }
      if (bodyDigest && descValue && descValue !== (currentDesc ?? "")) {
        translations.push({
          key: "body_html",
          locale,
          value: plainTextToShopifyHtml(descValue),
          translatableContentDigest: bodyDigest,
        });
      }
    };

    pushLocale(ptLocale, nextTitlePt, nextDescPt, current.title.pt, current.description.pt);
    pushLocale(esLocale, nextTitleEs, nextDescEs, current.title.es, current.description.es);

    if (translations.length > 0) {
      const register = await adminGraphql(auth.domain, auth.token, TRANSLATIONS_REGISTER, {
        resourceId: id,
        translations,
      });
      const payload = asRecord(asRecord(asRecord(register.json)?.data)?.translationsRegister);
      const problems = [...register.errors, ...readUserErrors(payload)];
      if (!register.ok || problems.length > 0) {
        const detail = problems.join("; ") || "translationsRegister without payload";
        logAdminFailure("[pushShopifyCollectionCopy] translationsRegister failed", detail);
        warnings.push(`translations failed: ${detail}`);
        return { ok: true, skipped: !wrote, warnings };
      }
      wrote = true;
    }

    return { ok: true, skipped: !wrote, warnings };
  } catch (err) {
    logAdminFailure("[pushShopifyCollectionCopy] Admin GraphQL failed", String(err));
    return { ok: false, reason: "transport_error" };
  }
}
