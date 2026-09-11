# DatoCMS — next-dato

Web Previews / Content Link: [SECURITY.md](./SECURITY.md). Cache tags nos fetches: [`.cursor/rules/datocms-next.mdc`](../.cursor/rules/datocms-next.mdc).

## Onde corre cada coisa

Há **três** superfícies. Não partilham autenticação.

| Superfície | Para quê | Auth |
|------------|----------|------|
| **Next.js** (local, Vercel, CI) | Páginas, GraphQL CDA, draft, codegen | Variáveis no `.env` / Vercel / GitHub Secrets — tokens **CDA** (e CMA só para user reviews) |
| **CLI + Agent Skills** | Schema, migrations, `schema:inspect`, CMA no terminal | OAuth (`npx datocms login`) + [`datocms.config.json`](../datocms.config.json) no Git. **Não** usa os tokens CDA. |
| **MCP** (opcional, Cursor) | Chat remoto sem terminal | OAuth no browser (`https://mcp.datocms.com`). Sem tokens no JSON. |

O `datocms.config.json` **não** substitui o `.env` e **não** é lido pela Vercel. Sem `DATOCMS_API_TOKEN` (CDA) no deploy, o site não busca conteúdo.

**Não** coloques um token CMA em `DATOCMS_API_TOKEN`: neste repo esse nome é o CDA publicado. A CLI, depois de `login` + `link`, resolve o token via OAuth e ignora o CDA do `.env`.

### Vercel — nada de novo por causa da CLI

Não é preciso variável extra na Vercel para Skills/CLI. Mantém (Production e Preview) o que o Next já usa:

| Variável | Tipo |
|----------|------|
| `DATOCMS_API_TOKEN` | CDA publicado |
| `DATOCMS_DRAFT_CDA_TOKEN` | CDA com rascunhos (Draft Mode) |
| `DATOCMS_USER_REVIEWS_CDA_TOKEN` | CMA com permissão de `user_review` |
| `DATOCMS_PREVIEW_SECRET` | Web Previews / `/api/draft` |
| `DATOCMS_REVALIDATE_SECRET` | Webhook `POST /api/revalidate` |
| `NEXT_PUBLIC_SITE_URL` | URL canónica do deploy |
| `NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL` | `https://boilerplate-dato.admin.datocms.com` |
| `DATOCMS_ADMIN_FRAME_ANCESTOR` | Opcional, mesmo host do admin |
| `DATOCMS_ENVIRONMENT` | Opcional; neste projeto o primary é `main` |

Lista completa: [`.env.example`](../.env.example). Secrets de CI: [SECURITY.md](./SECURITY.md).

## CLI — passo a passo (quem clona o repo)

Pré-requisito: acesso ao projeto Dato **Boilerplate DATO** (`siteId` `201057`, admin `https://boilerplate-dato.admin.datocms.com`). Conta pessoal, sem `organization-id`.

```bash
cp .env.example .env   # preencher tokens CDA — o site e o codegen
npm install

npx datocms login       # uma vez por máquina; abre o browser (OAuth)
npx datocms whoami      # confirma email / nome
```

Credenciais OAuth ficam em `~/.config/datocms/credentials.json` (fora do Git).

Se o repo **já** tem [`datocms.config.json`](../datocms.config.json) com `"siteId": "201057"`, o `link` já foi feito. Basta o `login`. Verifica:

```bash
npx datocms environments:list
```

Esperado: `main` (primary) e `develop`.

Se o config **não** existir (fork novo, `unlink`, outro projeto):

```bash
npx datocms projects:list --json
# Confirma o alvo com a equipa, depois:
npx datocms link --site-id=201057
```

Não corras `link` contra outro `siteId` sem acordo — o ficheiro no Git é a fonte de verdade para este boilerplate.

Úteis a seguir:

```bash
npx datocms schema:inspect
npx datocms environments:list
```

Schema GraphQL do Next continua com `npm run codegen` (usa `DATOCMS_API_TOKEN` do `.env`, não a CLI).

### Agent Skills oficiais

Já estão em [`.agents/skills/`](../.agents/skills/) (pacote `datocms/agent-skills`). Actualizar:

```bash
npx skills update
```

Instalação de raiz (Cursor):

```bash
npx skills add datocms/agent-skills --agent cursor --skill '*' -y --copy
```

No código deste repo, as convenções em [AGENTS.md](../AGENTS.md) e `.cursor/skills/` (ex.: `add-datocms-block`) prevalecem sobre receitas genéricas Next da Dato.

### CI / sem browser

Só aí um token **CMA** (`can_access_cma`) faz sentido — secret à parte, **nunca** no lugar do CDA. Desenvolvimento local: OAuth.

## Revalidação on-demand

Os fetches publicados usam `next.tags` (`datocms:page`, `page:en:page-two`, `datocms:navigation`, …) e ISR de 300s. Sem webhook, uma publicação no Dato só aparece no site depois desse intervalo (ou de um redeploy).

Rota: [`POST /api/revalidate`](../src/app/api/revalidate/route.ts).

| | |
|--|--|
| URL | `https://<domínio>/api/revalidate` |
| Auth | Header `Authorization: Bearer <DATOCMS_REVALIDATE_SECRET>` **ou** `?token=<secret>` |
| Secret | Variável **Secret** na Vercel: `DATOCMS_REVALIDATE_SECRET` (não reutilizar o preview secret) |

Não é preciso Turso/Postgres: este repo não passa as tags opacas da CDA ao `fetch` (limite de 64 no Next). O webhook mapeia o payload Dato para as **mesmas** strings dos `get-*.ts`.

### Criar o webhook no Dato

1. **Settings → Webhooks → Create a new webhook**.
2. **URL:** `https://enterprise-next-datocms.vercel.app/api/revalidate`
3. **HTTP headers:** `Authorization` = `Bearer ` + o valor de `DATOCMS_REVALIDATE_SECRET` (espaço depois de Bearer).
4. **Triggers** (um webhook chega):
   - **Record:** `create`, `update`, `delete`, `publish`, `unpublish` (itens).
   - Opcional: **CDA Cache Tags → Invalidate** — o handler trata `entity.attributes.tags` e revalida as famílias completas (`datocms:page`, nav, sitemap, …).
5. Guardar e **Send a ping** / publicar um record. A resposta deve ser `{ "revalidated": true, "tags": [...] }` (200). Sem secret na Vercel → 500; token errado → 401.

Local: `http://localhost:3000/api/revalidate` + túnel (ngrok) se quiseres testar o Dato contra o teu `next dev`.

### Vercel

`DATOCMS_REVALIDATE_SECRET` em Production e Preview, Type **Secret**. Depois de gravar, o webhook do Dato tem de usar **exactamente** o mesmo valor.

### Eventos e tags

| Payload Dato | Tags Next |
|--------------|-----------|
| `item` modelo `page` | `datocms:page`, `page:{locale}:{slug}`, sitemap, search |
| `post` / `author` / `category` | famílias `datocms:blog` + slug (`post:…`, `author-posts:{id}`, …) |
| `navigation` / `global_setting` | `datocms:navigation` / `datocms:global-settings` + por locale |
| `redirect` | `datocms:redirects` |
| CDA `tags[]` ou modelo desconhecido | [famílias coarse](../src/lib/datocms/revalidate-tags.ts) |

O ISR de 300s permanece como rede de segurança se o webhook falhar.
