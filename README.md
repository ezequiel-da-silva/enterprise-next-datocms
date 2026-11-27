# next-dato

Next.js 16 + DatoCMS + Shopify Storefront. **Agents and contributors:** start at [AGENTS.md](AGENTS.md).

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](AGENTS.md) | Stack, commands, anti-patterns |
| [docs/AI-PLAYBOOK.md](docs/AI-PLAYBOOK.md) | How agents pick rules/skills |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, RSC boundaries, analytics |
| [docs/SECURITY.md](docs/SECURITY.md) | CSP, headers, honeypot smoke |
| [docs/QUALITY-GATES.md](docs/QUALITY-GATES.md) | Pre-merge pillars |
| [docs/GITHUB.md](docs/GITHUB.md) | Branches, Actions, required checks |
| [docs/DATOCMS.md](docs/DATOCMS.md) | CMS, CLI, CMA scripts |
| [docs/SHOPIFY.md](docs/SHOPIFY.md) | Catalog, cart, GA4 |

Stack notes: App Router under `src/app/[slug]/…`; fonts **Inter** + **Roboto Mono** via `next/font` in [`src/app/layout.tsx`](src/app/layout.tsx). Package manager: **npm** (`package-lock.json`).

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy [`.env.example`](.env.example) to `.env` and configure DatoCMS **CDA** tokens before fetching CMS content (Next.js / Vercel). `npm run codegen` is local; `npm run codegen:schema` needs the token after Dato model changes.

The DatoCMS **CLI** (schema, migrations, Agent Skills) is separate: OAuth on your machine plus committed [`datocms.config.json`](datocms.config.json). It does **not** add Vercel env vars. Setup: [docs/DATOCMS.md](docs/DATOCMS.md) (CLI passo a passo).

### DatoCMS cache revalidation

Create a dedicated random secret (do not reuse `DATOCMS_PREVIEW_SECRET`):

```bash
openssl rand -hex 32
```

1. Add the result locally as `DATOCMS_REVALIDATE_SECRET` in `.env`.
2. In Vercel, add `DATOCMS_REVALIDATE_SECRET` as a **Secret** for Production and Preview, then redeploy.
3. In DatoCMS, create a webhook for record create/update/delete/publish/unpublish:
   - URL: `https://<your-domain>/api/revalidate`
   - Header: `Authorization: Bearer <same-secret>`
   - Payload: API v3
4. Send a ping or publish a record. A valid request returns HTTP 200 with `"revalidated": true`; a different secret returns 401.

Never commit the generated value. Full webhook and cache-tag mapping: [docs/DATOCMS.md](docs/DATOCMS.md).

### Shopify (catálogo / PDP)

App no Dev Dashboard (webhooks) + canal Headless (Storefront). Variáveis `SHOPIFY_*` só no servidor (Vercel privadas). Guia: [docs/SHOPIFY.md](docs/SHOPIFY.md).

## For AI agents

Start with [AGENTS.md](AGENTS.md), then [docs/AI-PLAYBOOK.md](docs/AI-PLAYBOOK.md) and [docs/QUALITY-GATES.md](docs/QUALITY-GATES.md).

Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Cursor rules: `.cursor/rules/`. Skills: `.cursor/skills/` (this repo) and `.agents/skills/` (official DatoCMS).

Quality gate: `npm run check-all` (typecheck, test, lint, build). GraphQL drift: `npm run codegen:check`.

## GitHub

Flow: feature → `develop` → `main` → Release Please PR → tag. Full setup: [docs/GITHUB.md](docs/GITHUB.md). Gates: [docs/QUALITY-GATES.md](docs/QUALITY-GATES.md). Secrets: [docs/SECURITY.md](docs/SECURITY.md).

Checklist (repo **Settings**):

- [ ] **Actions → General → Workflow permissions:** Read and write + **Allow GitHub Actions to create and approve pull requests**
- [ ] **General → Pull Requests:** Automatically delete head branches
- [ ] **Branches:** protect `main`, `develop` — **Allow deletions** off; required checks `quality`, `lighthouse (desktop)`, `lighthouse (mobile)`, `security`, `smoke`
- [ ] **Do not allow bypassing** on `main` (recommended on `develop` if the team is more than one person)
- [ ] **Secrets and variables → Actions:** DatoCMS tokens for CI builds (see [docs/SECURITY.md](docs/SECURITY.md))

## Segurança

Scripts de auditoria de dependências e validação de headers HTTP:

```bash
npm run security:audit
npm run build && npm run start:prod                  # terminal 1
NODE_ENV=production npm run security:headers         # terminal 2
```

Guia completo: [docs/SECURITY.md](docs/SECURITY.md). CI: [`.github/workflows/security.yml`](.github/workflows/security.yml).
