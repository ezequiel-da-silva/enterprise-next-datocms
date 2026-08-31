---
name: add-datocms-block
description: >-
  Add or update a DatoCMS Structured Text block in next-dato. Use when creating
  a new block model, GraphQL fragment, block component, or registering
  FaqGroupRecord/CtaBannerRecord-style blocks in StructuredTextBlockView.
---

# Add DatoCMS Structured Text block

Follow this workflow end-to-end. Read [AGENTS.md](../../AGENTS.md) and `.cursor/rules/datocms-blocks.mdc` first.

## 1. Inspect schema

Open `src/infra/datocms/generated/schema.types.ts`:

- Find `{Name}Record` and `PageModelStructuredTextBlocksField` union
- Note exact **camelCase** GraphQL field names (`hasImage`, `titleFeatureGrid`, etc.)

## 2. GraphQL (both files — must stay in sync)

**Runtime query:** `src/infra/datocms/queries.ts`

- Add constant fragment (reuse `LINK_HERO_CTA_FIELDS`, `IMAGE_BLOCK_RESPONSIVE`)
- Append to `PAGE_STRUCTURED_TEXT_BLOCKS`

**Codegen input:** `src/infra/datocms/graphql/page-by-slug.graphql`

- Mirror the same `... on {Name}Record { ... }` block under `structuredText.blocks`

Optional: `src/infra/datocms/graphql/fragments/{kebab-name}.graphql` for documentation.

## 3. Codegen

```bash
npm run codegen
```

Never hand-edit `src/infra/datocms/generated/**`.

## 4. Types

In `src/infra/datocms/types-page.ts`:

```ts
export type MyBlockRecord = Extract<PageStructuredTextBlock, { __typename: "MyRecord" }>;
// or import from schema.types.ts when Extract is incomplete pre-codegen
```

## 5. Options resolver (if `advanced_options` or toggles)

Create `src/lib/datocms/resolve-{block}-options.ts`:

- Document fields + defaults in file header (see `resolve-faq-group-options.ts`)
- Export `DEFAULTS` and `resolve{Name}Options(record)`
- Test snake_case + camelCase + PT select labels

For image toggles: see `resolve-cta-banner-image.ts`.

## 6. Block component

- Location: `src/components/patterns/{name}-block.tsx` or `src/components/sections/` for full-width sections
- Export `{Name}Block`
- Wrap in `<section className="not-prose my-12 w-full ..." data-datocms-content-link-boundary="">`
- Preserve stega in visible copy with `readCdaString()`; use `readCdaStringForLogic()` for selects, comparisons, IDs, URLs, SEO or other programmatic use
- Wrap Structured Text in `data-datocms-content-link-group`; keep boundaries on its blocks/inline records
- For a block with no editable text (video/number/boolean/JSON), query `_editingUrl` in both GraphQL sources and set `data-datocms-content-link-url`
- Conteúdo alinhado: `<Container size="lg">` (ou `md`/`sm` se for bloco estreito) — não inventar `mx-auto max-w-* px-4`
- Reuse: `Container`, `SmartLink`, `Button`, `DatoResponsivePicture`, `readCda*`
- Async if you need `await getNonce()` — use `JsonLdScriptSync` for JSON-LD

**Reference implementations:**

- FAQ: `src/components/patterns/faq-group-block.tsx` + `faq-group-accordion.tsx` (client)
- CTA: `src/components/sections/cta-banner-block.tsx` + `resolve-cta-banner-options.ts` (usa `Container size="lg"`)

## 7. Register block

In `src/components/patterns/structured-text-block-view.tsx`:

```tsx
case "MyRecord":
  return <MyBlock record={record as MyBlockRecord} locale={locale} />;
```

## 8. Tests

- Resolver / image helper / JSON-LD builder unit tests
- `npm run typecheck && npm test`

## 9. Manual CMS check

- Add block to a test page in DatoCMS
- Verify all variants/toggles in dev
- Confirm no `[StructuredText] Bloco ST não implementado` warning in console
- In Draft Mode, confirm every block has an automatic or explicit Content Link target and no “Multiple stega-encoded payloads” warning
