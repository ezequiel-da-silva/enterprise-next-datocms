# AI Playbook (next-dato)

How AI agents should work in this repository. Start every session with [AGENTS.md](../AGENTS.md).

## Workflow

1. Read **AGENTS.md** (stack, commands, anti-patterns).
2. Pick the **rule** for your file scope (see table below).
3. For multi-step tasks, open the matching **skill** in `.cursor/skills/`.
4. Before finishing, run commands from [QUALITY-GATES.md](./QUALITY-GATES.md).
5. Self-review against the PR checklist in QUALITY-GATES.

## Task routing

| Task | Read first | Skill / rule |
|------|------------|--------------|
| New DatoCMS ST block | `datocms-blocks.mdc` | `add-datocms-block` |
| Page metadata / JSON-LD | `web-excellence.mdc` | `seo-aeo-feature` |
| CSP, draft, API, forms | `security.mdc` | — |
| RSC, error boundaries, client boundaries | `react-rsc.mdc` | — |
| Layer / import boundaries | `architecture.mdc` | — |
| Unit tests for resolvers | `testing.mdc` | — |
| Pre-merge verification | QUALITY-GATES | `pre-merge-quality` |
| Next.js API uncertainty | `node_modules/next/dist/docs/` | — |

## Cursor rules (`.cursor/rules/`)

| File | Scope |
|------|--------|
| `web-excellence.mdc` | SEO, perf, AEO, ATF, a11y (always on) |
| `security.mdc` | CSP, secrets, draft, validation (always on) |
| `architecture.mdc` | Layers, naming, imports (always on) |
| `datocms-blocks.mdc` | GraphQL, blocks, ST registration |
| `react-rsc.mdc` | App Router RSC patterns |
| `testing.mdc` | Vitest conventions |

## Project skills (`.cursor/skills/`)

| Skill | Use when |
|-------|----------|
| `add-datocms-block` | Adding or extending a Structured Text block |
| `pre-merge-quality` | Before commit/PR — run gates |
| `seo-aeo-feature` | Metadata, sitemap, JSON-LD, FAQ schema |

## Do not edit

- `src/infra/datocms/generated/**` — regenerate with `npm run codegen`
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
- After Dato schema changes, agent runs codegen and updates queries + components.
- PR template maps to QUALITY-GATES pillars — fill honestly.
