# AI Playbook (next-dato)

How AI agents should work in this repository. Start every session with [AGENTS.md](../AGENTS.md).

## Workflow

1. Read **AGENTS.md** (stack, commands, anti-patterns).
2. Pick the **rule** for your file scope (see table below).
3. For multi-step tasks, open the matching **skill** in `.cursor/skills/` (repo conventions) or `.agents/skills/` (official DatoCMS CLI/CMA).
4. Before finishing, run commands from [QUALITY-GATES.md](./QUALITY-GATES.md).
5. Self-review against the PR checklist in QUALITY-GATES (and [UI-CHECKLIST.md](./UI-CHECKLIST.md) / `ux-principles` when UI changed).

## Task routing

| Task | Read first | Skill / rule |
|------|------------|--------------|
| New DatoCMS ST block | `datocms-blocks.mdc` | `add-datocms-block` |
| Page metadata / JSON-LD | `web-excellence.mdc` | `seo-aeo-feature` |
| UI / commercial flows / UX audit | `ux-principles.mdc` + `ui-visual.mdc` | `ux-audit` |
| CSP, draft, API, forms | `security.mdc` | — |
| Dato webhook / cache tags | `datocms-next.mdc` + [DATOCMS.md](./DATOCMS.md) | — |
| Shopify webhooks / Headless / PDP | [SHOPIFY.md](./SHOPIFY.md) | — |
| Schema / migrations / CLI | [DATOCMS.md](./DATOCMS.md) (CLI passo a passo) | `.agents/skills/datocms-cli` |
| RSC, error boundaries, client boundaries | `react-rsc.mdc` | — |
| Layer / import boundaries | `architecture.mdc` | — |
| Unit tests for resolvers | `testing.mdc` | — |
| Pre-merge verification | QUALITY-GATES | `pre-merge-quality` |
| Next.js API uncertainty | `node_modules/next/dist/docs/` | — |

## Nova página comercial

Prefer this order (**Occam** / `ux-principles`):

1. Model content as Dato `content_page` (or legal page) with modular blocks: `hero_section`, `faq_group`, `feature_grid`, `content_listing_section`, CTA, etc.
2. Seed/update with an idempotent `scripts/setup-*.ts` (or `update-*.ts`) via `npx datocms cma:script … --profile=…`.
3. Align human policy copy with `market_policy` when the page mentions shipping/returns.
4. Add an App Router route **only** if the surface needs Shopify session, cart cookie, or non-CMS semantics (`products/[handle]`, `cart`, `account`, `order/confirmation`).

`ui_string` / `get*Copy`: resolve in `app/` (or root layout), pass props — never `get-*` inside `components/`; never pass non-serializable server functions into Client Components.

## Cursor rules (`.cursor/rules/`)

| File | Scope |
|------|--------|
| `architecture.mdc` | Layers, naming, imports (**always on**) |
| `git-conventions.mdc` | Conventional Commits + PR titles (**always on**) |
| `web-excellence.mdc` | SEO, perf, AEO, ATF, a11y (globs: app/components/seo) |
| `ui-visual.mdc` | Tokens, surfaces, type scale (globs: components/app UI) |
| `ux-principles.mdc` | 32 UX laws / cognitive checklist (globs: components/app UI) |
| `security.mdc` | CSP, secrets, draft, validation (globs: proxy/API/actions) |
| `datocms-blocks.mdc` | GraphQL, blocks, ST registration |
| `datocms-next.mdc` | Draft, cache tags, Next↔Dato |
| `react-rsc.mdc` | App Router RSC patterns |
| `testing.mdc` | Vitest conventions |

## Project skills (`.cursor/skills/`)

| Skill | Use when |
|-------|----------|
| `add-datocms-block` | Adding or extending a Structured Text block |
| `pre-merge-quality` | Before commit/PR — run gates |
| `seo-aeo-feature` | Metadata, sitemap, JSON-LD, FAQ schema |
| `ux-audit` | New/refactored UI or commercial flow; UX law review |

Official DatoCMS CLI/CMA skills: [`.agents/skills/`](../.agents/skills/). Bootstrap: [DATOCMS.md](./DATOCMS.md).

## Do not edit

- `src/infra/datocms/generated/**` — `npm run codegen`; after Dato model changes `npm run codegen:from-dato`
- `.env` — never commit secrets
- `.cursor/plans/**` — user-owned plan files unless asked

## Context budget tips

- Prefer reading **one** canonical example block (FAQ or CTA) over exploring the whole repo.
- For Next.js APIs, read `node_modules/next/dist/docs/` — this project uses Next 16 with breaking changes.
- GraphQL: update **both** `queries.ts` and `page-by-slug.graphql` before codegen.

## Cursor hooks

Project hooks in [`.cursor/hooks.json`](../.cursor/hooks.json):

| Event | Purpose |
|-------|---------|
| `afterFileEdit` | Remind to run typecheck after `src/` edits |
| `stop` | Agent completion checklist |
| `beforeShellExecution` | Block destructive git/shell commands |

Hooks fail open (warn only) except shell-guard for dangerous commands.

## Human + agent collaboration

- Agents implement; humans approve architecture changes and CMS schema in Dato admin.
- After Dato schema changes, agent runs `npm run codegen:from-dato` and updates queries + components.
- PR template maps to QUALITY-GATES pillars — fill honestly.
