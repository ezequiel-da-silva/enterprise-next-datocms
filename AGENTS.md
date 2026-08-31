<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — next-dato

Single entry point for AI agents working in this repository.

## Stack

- **Next.js 16** App Router, **React 19** Server Components
- **DatoCMS** (CDA + draft preview)
- **Tailwind CSS v4**, TypeScript, **Vitest**
- CSP with per-request nonce ([`src/proxy.ts`](src/proxy.ts))

## Architecture (short)

| Layer | Path | Notes |
|-------|------|--------|
| Routes | `src/app/` | RSC pages, API routes, Server Actions |
| UI | `src/components/` | atoms → molecules → patterns → sections; layout via `Container` |
| Pure helpers | `src/lib/` | SEO, Dato field parsers, a11y, security utils |
| Domain | `src/core/` | entities + use-cases — **no React/Next** |
| I/O | `src/infra/` | Dato fetch, GraphQL, external integrations |

Full diagram: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Mandatory commands

| When | Command |
|------|---------|
| Always before merge | `npm run typecheck` · `npm test` · `npm run lint` |
| UI / routes / layout changed | `npm run build` |
| GraphQL or Dato schema changed | `npm run codegen` |
| Proxy / API / auth changed | `npm run security:check` |
| Full local gate | `npm run check-all` |
| E2E smoke (needs build + Chromium) | `npm run build && npm run test:e2e` |

Copy [`.env.example`](.env.example) to `.env` for CMS and codegen.

## Cursor rules (`.cursor/rules/`)

- [`web-excellence.mdc`](.cursor/rules/web-excellence.mdc) — SEO, perf, AEO, a11y
- [`security.mdc`](.cursor/rules/security.mdc) — CSP, secrets, draft mode
- [`architecture.mdc`](.cursor/rules/architecture.mdc) — layers, naming, imports
- [`datocms-blocks.mdc`](.cursor/rules/datocms-blocks.mdc) — CMS blocks + GraphQL
- [`datocms-next.mdc`](.cursor/rules/datocms-next.mdc) — RSC fetch, cache tags, codegen, images
- [`git-conventions.mdc`](.cursor/rules/git-conventions.mdc) — Conventional Commits + PR titles · repo settings: [docs/GITHUB.md](docs/GITHUB.md)
- [`react-rsc.mdc`](.cursor/rules/react-rsc.mdc) — RSC, error boundaries
- [`testing.mdc`](.cursor/rules/testing.mdc) — Vitest patterns

## Project skills (`.cursor/skills/`)

- `add-datocms-block` — new Structured Text block workflow
- `pre-merge-quality` — run quality gates before PR
- `seo-aeo-feature` — metadata + JSON-LD

Playbook: [docs/AI-PLAYBOOK.md](docs/AI-PLAYBOOK.md) · Gates: [docs/QUALITY-GATES.md](docs/QUALITY-GATES.md) · GitHub: [docs/GITHUB.md](docs/GITHUB.md)

## Learned anti-patterns (do not repeat)

1. **Async Server Component inside sync parent** — e.g. `<SeoManager />` in sync `FaqGroupBlock`. Fix: async block + `JsonLdScriptSync`, or resolve nonce in async parent.
2. **`error.tsx` with `<html>` / `<body>`** — only [`global-error.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error) may wrap full document. Route `error.tsx` = fragment/div only.
3. **`dynamic()` on Server Components** in Structured Text — import blocks directly.
4. **`SmartLink` inside `Button asChild`** — pass `tone="inherit"` so button colors are not overridden by `text-primary`.
5. **GraphQL drift** — update both [`queries.ts`](src/infra/datocms/queries.ts) and [`page-by-slug.graphql`](src/infra/datocms/graphql/page-by-slug.graphql), then codegen.
6. **Content Link drift in CMS blocks** — every ST block root needs a boundary; Structured Text needs a group; non-render string logic must use `readCdaStringForLogic()` / `stripStega()`; textless blocks need `_editingUrl`.

## Do not edit

- `src/infra/datocms/generated/**`
- `.env` or committed secrets

## Security docs

[docs/SECURITY.md](docs/SECURITY.md) · Revalidate: [docs/DATOCMS.md](docs/DATOCMS.md) · CI: [`.github/workflows/security.yml`](.github/workflows/security.yml)
