---
name: seo-aeo-feature
description: >-
  Add or update SEO metadata and JSON-LD (AEO) in next-dato. Use for new pages,
  generateMetadata, sitemap changes, FAQ schema, WebPage/BreadcrumbList JSON-LD,
  or CMS blocks that emit structured data.
---

# SEO / AEO feature

Rules: `.cursor/rules/web-excellence.mdc` · Gates: [docs/QUALITY-GATES.md](../../docs/QUALITY-GATES.md)

## Metadata (pages)

**CMS-driven pages:**

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const result = await getPageBySlug(...);
  return buildDatoPageMetadata({ path, seoMetaTags, faviconMetaTags, seoSettingsSocial });
}
```

**Static pages:** `export const metadata = buildMetadata({ title, description, path })`

Base URL, 404 / search `noIndex` cases and the existing builders: `web-excellence.mdc` (SEO + AEO sections).

## JSON-LD builders

- Location: `src/lib/seo/`
- Add unit test in `*.test.ts` beside builder
- Shape: `{ "@context": "https://schema.org", "@graph": [...] }`
- Also: `buildFaqPageJsonLd()` (FAQ block), `buildProductPageJsonLd()` / `buildCollectionPageJsonLd()` (Shopify)

## Injection (CSP-safe)

Use [`JsonLdScript`](../../src/components/patterns/seo-manager.tsx) in async layouts/pages, or [`JsonLdScriptSync`](../../src/components/patterns/seo-manager.tsx) when nonce is already resolved:

```tsx
const nonce = await getNonce();
return <JsonLdScriptSync graph={jsonLd} nonce={nonce} />;
```

**Inside Structured Text blocks:** block component must be `async` OR use `JsonLdScriptSync` with `await getNonce()` in that async block. Never nest async `JsonLdScript` in sync ST parent.

## Breadcrumbs

- Visible: `BreadcrumbNav`
- Schema: `BreadcrumbList` in page JSON-LD — labels and URLs must match

## Sitemap / robots / manifest

- `src/app/sitemap.ts` — dynamic sources from Dato
- `src/app/robots.ts`, `manifest.ts` — keep aligned with indexable routes

## Verification

- View page source: `<script type="application/ld+json" nonce="...">`
- Rich Results Test / Schema validator for new types
- `npm test` for builder unit tests
