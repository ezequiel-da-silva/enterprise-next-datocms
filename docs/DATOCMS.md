# DatoCMS — next-dato

Web Previews / Content Link: [SECURITY.md](./SECURITY.md). Cache tags nos fetches: [`.cursor/rules/datocms-next.mdc`](../.cursor/rules/datocms-next.mdc).

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
