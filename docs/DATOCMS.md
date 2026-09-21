# DatoCMS — next-dato

Web Previews / Content Link: [SECURITY.md](./SECURITY.md). Cache tags nos fetches: [`.cursor/rules/datocms-next.mdc`](../.cursor/rules/datocms-next.mdc).

## Onde corre cada coisa

Há **três** superfícies. Não partilham autenticação.

| Superfície | Para quê | Auth |
|------------|----------|------|
| **Next.js** (local, Vercel, CI) | Páginas, GraphQL CDA, draft | Variáveis no `.env` / Vercel / GitHub Secrets — tokens **CDA** (e CMA só para user reviews) |
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
| `DATOCMS_USER_REVIEWS_CDA_TOKEN` | CMA (`user_review` + `product_page` / `collection_page` / webhook Shopify) |
| `DATOCMS_PREVIEW_SECRET` | Web Previews / `/api/draft` |
| `DATOCMS_REVALIDATE_SECRET` | `POST /api/revalidate` e webhooks Dato `product-page` / `collection-page` |
| `NEXT_PUBLIC_SITE_URL` | URL canónica do deploy |
| `NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL` | `https://boilerplate-dato.admin.datocms.com` |
| `DATOCMS_ADMIN_FRAME_ANCESTOR` | Opcional, mesmo host do admin |
| `DATOCMS_ENVIRONMENT` | CDA + CMA Shopify; default `main`. Catálogo neste ciclo: `develop` até o promote. |

Shopify (`SHOPIFY_*`): [SHOPIFY.md](./SHOPIFY.md) — também privadas na Vercel.

Lista completa: [`.env.example`](../.env.example). Secrets de CI: [SECURITY.md](./SECURITY.md).

## CLI — passo a passo (quem clona o repo)

Pré-requisito: acesso ao projeto Dato **Boilerplate DATO** (`siteId` `201057`, admin `https://boilerplate-dato.admin.datocms.com`). Conta pessoal, sem `organization-id`.

```bash
cp .env.example .env   # preencher tokens CDA — o site (e `codegen:schema` após mudar o modelo)
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

Schema GraphQL do Next: `npm run codegen` lê [`src/infra/datocms/generated/schema.graphql`](../src/infra/datocms/generated/schema.graphql) (sem CDA). Depois de alterar o modelo Dato: `npm run codegen:from-dato` (dump CDA com `DATOCMS_API_TOKEN` + `DATOCMS_ENVIRONMENT` do `.env`). Se a introspecção CDA estiver indisponível (quota), `node scripts/schema-types-to-sdl.mjs && npm run codegen` gera um SDL de recurso a partir dos tipos já commitados — substitui com o dump live assim que o CDA voltar.

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

## Imagens (blocos especializados + `image_block`)

No sandbox **develop**, slots de hero/card/banner usam blocos **próprios** (migrations `1789135631_specializedImageBlocksHeroCardBanner.ts` e `1789138255_cardBannerDualMobileDesktopAssets.ts`). O Dato não aceita um enum “16:9 **ou** 4:3”: usa-se intervalo `min_*`–`max_*` em `image_aspect_ratio`, mais hints no admin. Caption = `required_alt_title.title` (não há campo caption irmão). Extensões: `jpg, jpeg, png, webp, avif` (sem gif).

| Bloco | Campos | Aspect ratio | Dimensões |
|-------|--------|--------------|-----------|
| `hero_image_block` | `asset_desktop` (16:9), `asset_mobile` (4:5–1:1) | desktop `eq` 16:9; mobile min 4:5, max 1:1 | D 1280–3840×720–2160; M 750–1080×750–1350 |
| `card_image_block` | `asset_mobile` + `asset_desktop` | min 4:3, max 16:9 (ambos) | M 600–1080×338–810; D 960–1920×540–1440 |
| `banner_image_block` | `asset_mobile` + `asset_desktop` | min 21:9, max 3:1 (ambos) | M 750–1440×250–617; D 1440–3840×480–1646 |
| `image_block` | `asset` + `asset_desktop` | (validators largos do bloco genérico) | logos, avatar, 404, Structured Text |

Allowlists no develop: `hero_section` (`image_hero`, `image_overlay`) → hero; `card` / `tab_item` / `step_card` / `post.cover_image` → card; `cta_banner.image_banner` → banner. Records antigos `ImageBlockRecord` **deixam de aparecer** nesses slots até o editor os substituir.

O Next mapeia `asset_mobile` → `mobile` e `asset_desktop` → `desktop` em `DatoResponsivePicture` nos três blocos. `image_block` residual continua com `asset` (mobile) + `asset_desktop`.

## Text section (`text_section`)

Organismo do Modular Content `content_page` da Page (sandbox **develop**, migrations `1789152029_textSectionHeaderAndStructuredTextBody.ts`, `1789152399_textSectionHeaderAsRichTextEqOne.ts` e `1789161639_optionalTextSectionHeaderToggle.ts`). Não é um “bloco parágrafo”: o corpo é **Structured Text**.

| Campo | Tipo | Notas |
|-------|------|--------|
| `has_text_header` | Boolean | Mostra/oculta no admin e no frontend o cabeçalho da secção |
| `text_header_section` | Modular Content, 0–1× `text_header` | Título h2, descrição e section ID. Igual às outras secções (`[TextHeaderRecord!]!` no CDA — a union GraphQL exige o mesmo tipo do campo em todos os organismos) |
| `body` | Structured Text | Nós nativos (listas, citação, código, headings **h3–h4**, links). Blocos: `image_block`, `image_gallery_block`, `video_block`. Links a `page`. |

O `h1` continua no hero; quando `has_text_header` está ativo, o `h2` vem do `text_header`. O toggle desativado também ignora conteúdo residual no frontend. O stub vazio no **main** não foi preenchido (não promover).

Inspect: `npx datocms schema:inspect text_section --environment=develop --include-validators`.

Inspect: `npx datocms schema:inspect hero_image_block --environment=develop --include-validators`.

- Schema (CLI): `npx datocms migrations:run --source=develop --in-place` — **não** promove para `main`.
- Conteúdo no Next: `DATOCMS_ENVIRONMENT=develop` no `.env` (CDA). O token CDA tem de ter acesso ao sandbox `develop`.
- GraphQL: após o schema no ambiente do `.env`, `npm run codegen:from-dato` e commit de `src/infra/datocms/generated/**` (SDL + tipos). `npm run codegen` sozinho basta quando só mudam queries. Não editar `generated/` à mão.
- CI (`codegen:check`) é **offline** (SDL versionado). Promove o schema Dato para `main` no mesmo ciclo das queries novas — tipos verdes não impedem erro CDA em produção se o campo ainda não existir no primary.

## Página do blog

O índice do blog é uma `Page` normal: Hero, SEO, título, `content_page` e slug vêm do
registo selecionado em **Global setting → Blog page**. Para listar artigos, adicione
`Content listing section` ao conteúdo dessa Page e escolha **Blog listing configuration**.

- A slug localizada da Page controla apenas o índice (por exemplo, `/pt/noticias`).
- Artigos, categorias e autores mantêm os URLs estáveis em `/{locale}/blog/*`.
- Breadcrumbs e o botão do 404 apontam para a Page configurada.
- Enquanto a migration ainda não tiver sido aplicada ou o campo estiver vazio, o
  fallback continua a ser `/{locale}/blog`.
- Depois de mudar a slug, mantenha um `Redirect` da URL antiga para a nova.

## Página de contacto

A página de contacto é uma `Page` normal: título, Hero, SEO, slug e `content_page` vêm do
registo em **Global setting → Contact page**. Inclua o bloco **Contact form section**.

O formulário (nome, e-mail, mensagem, honeypot, rate limit, webhook) continua no Next
([`ContactForm`](../src/components/patterns/contact-form.tsx) + [`submitContact`](../src/app/actions/contact.ts)). O CMS só define cabeçalho, intro, mensagem de sucesso e nota de privacidade.

Slugs locais de exemplo: `contact` (en), `contato` (pt), `contacto` (es). `/contato` (sem locale) redirecciona para a Page do locale por omissão.

- Enquanto a migration não existir ou o campo estiver vazio, o fallback é `/{locale}/contato`.
- JSON-LD usa `@type: ContactPage` quando o id da Page coincide com `contact_page`.
- Não promover este schema de `develop` para `main` até o front estar pronto no primary.

## Página de busca

A página de busca é uma `Page` normal: título, Hero, SEO, slug e `content_page` vêm do
registo em **Global setting → Search page**. Inclua o bloco **Search section**.

O widget (formulário GET `?q=`) e a query GraphQL `SEARCH_SITE` continuam no Next
([`SearchForm`](../src/components/patterns/search-form.tsx) + [`searchSite`](../src/infra/datocms/search.ts)). O CMS só define cabeçalho, intro, placeholder, rótulo do botão e copy de vazio / sem resultados.

Slugs locais de exemplo: `search` (en), `busca` (pt), `busqueda` (es). `/busca` (sem locale) redirecciona para a Page do locale por omissão, preservando `?q=`.

- Enquanto a migration não existir ou o campo estiver vazio, o fallback é `/{locale}/busca`.
- Sem query: metadata e SEO da Page (indexável, salvo o editor marcar `noIndex`).
- Com `?q=`: `noIndex` + canonical com a query; JSON-LD `@type: SearchResultsPage`.
- O `SearchAction` do layout aponta para o slug localizado da Page configurada.
- Não promover este schema de `develop` para `main` até o front estar pronto no primary.

## Busca no header

Em **Navigation → 🧭 Header**:

- `show_header_search`: mostra/oculta a segunda linha de busca;
- `header_search_placeholder`: placeholder localizado;
- `header_search_submit_label`: rótulo localizado do botão.

O formulário usa GET `?q=` e aponta para a Search Page configurada em Global setting. Em páginas
com Hero, o chrome sticky não reserva altura no fluxo: a hero passa por baixo do header translúcido,
com uma área segura para que título e ações não fiquem encobertos.

## Páginas legais (`legal_page`)

Modelo de colecção (não singleton): privacy, terms, refund, etc. **Não** é uma `Page` de landing — o corpo é Structured Text sem blocos de secção.

URL: `/{locale}/{slug}`. O slug **não é localizado** (o mesmo segmento em en / pt / es); título e conteúdo sim.

No Dato: **Navigation → Legal links** com paths tipo `/privacy-policy` (o Next acrescenta o locale). Não é preciso um pointer em Global setting.

SEO: o mesmo fieldset **🚀 SEO settings** de Page / Post / Author / Category — `seo_settings_social` (título, descrição, imagem, noIndex, Twitter card) e `seo_analysis` (plugin SEO/Readability no admin). O Next só lê `seo_settings_social` + `_seoMetaTags`. Se o corpo já tiver um heading nível 1, o título do registo não se repete como `<h1>`.

A query `LEGAL_PAGE_BY_SLUG` é independente de `PAGE_BY_SLUG`: em ambientes sem o modelo, a busca e o sitemap ignoram legais; páginas CMS continuam a funcionar.

Não promover este schema de `develop` para `main` até o front estar pronto no primary.

## Revalidação on-demand

Os fetches publicados usam `next.tags` (`datocms:page`, `page:en:page-two`, `datocms:navigation`, …) e ISR de 300s. Sem webhook, uma publicação no Dato só aparece no site depois desse intervalo (ou de um redeploy).

### Quota CDA (plano Free)

Cada POST a `graphql.datocms.com` conta para o tecto mensal, **mesmo com cache do Dato**. Para não esgotar 100k calls:

- O **proxy** aplica CSP em todos os paths, mas **não** chama `getRedirects()` em `/api`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `llms.txt` nem icons.
- O layout faz **uma** query de chrome (`GET_LAYOUT_CHROME`: navigation + `_site`) e **uma** de `global_setting` (404 + páginas índice). React `cache()` junta `getNavigation` / `getSiteSeo` e `getSearchPage` / `getContactPage` / `getBlogIndexPage` no mesmo request.
- **Não** misturar `PAGE_BY_SLUG` no layout: a query é enorme, as tags de revalidate são por slug, e rotas sem página CMS (PDP, 404, posts) não têm `$slug`.
- Em `next dev`, chrome/settings/redirects usam ISR de 60s. Páginas/posts por slug continuam `no-store` para não cachear `page: null` após um publish. Draft/Preview continua `no-store` + Content Link (`contentLink: v1` só com `draftMode`).
- `unstable_cache` no middleware **não** é usado: o Data Cache do `fetch` + `revalidateTag("datocms:redirects")` já cobre produção; memória no isolate da Vercel não é invalidada pelo webhook.
- `npm run codegen` / `codegen:check` / pre-push **não** chamam a CDA: usam o SDL em `generated/schema.graphql`. Só `npm run codegen:schema` (ou `codegen:from-dato`) introspecta, após mudar o modelo. Não mockar Lighthouse: os scores de a11y/SEO/ATF precisam do HTML verdadeiro.

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

Título Dato → Shopify: webhooks `…/api/webhooks/datocms/product-page` e `…/collection-page`, o mesmo Bearer, triggers **update** + **publish**. Playbook: [SHOPIFY.md](./SHOPIFY.md) § 4b.

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
| `product_page` | `datocms:product`, `product:{handle}`, sitemap |
| `collection_page` | `datocms:collection`, `collection:{handle}`, sitemap |
| CDA `tags[]` ou modelo desconhecido | [famílias coarse](../src/lib/datocms/revalidate-tags.ts) |

O ISR de 300s permanece como rede de segurança se o webhook falhar.

## Shopify → `product_page` / `collection_page`

Passo a passo: [SHOPIFY.md](./SHOPIFY.md).

`POST /api/webhooks/shopify` faz upsert CMA de `product_page` ou `collection_page`. Coleções `frontpage` / `home-page` são ignoradas. Dato → Shopify: `productUpdate` / `collectionUpdate` + `translationsRegister`. Webhook Dato de revalidate só invalida cache.

Índices: Global settings `products_page` e `collections_page`. PDP `/{locale}/products/{handle}`; PLP `/{locale}/collections/{handle}` (produtos da Storefront).

Nas fichas `product_page` / `collection_page` o editor só mexe em **copy** (`title`, `description`) e **SEO**. Preço, stock, imagens, membership da coleção e checkout ficam na Shopify; `shopify_handle` e IDs não se editam.

Listagens em páginas CMS usam um único bloco **Content listing section** (`content_listing_section`):

- O pai guarda somente apresentação partilhada: cabeçalho, limite, grid/carrossel/paginação/load more.
- **Listing configuration** é um `single_block` obrigatório: escolha **Blog listing configuration** ou **Shopify listing configuration**.
- Blog possui `fetch_mode` automático/manual e `filter_display` (`all`, `selected`, `none`), além de categorias, ordenação e posts manuais.
- Shopify possui `fetch_mode` automático/manual. No automático, `collection_filter` escolhe **All published products** ou **Selected collection**; `source_collection` só aparece na segunda opção (vazio = listagem vazia). No manual, usa `selected_products`.
- As listagens automáticas Shopify só mostram produtos com `product_page` (evita PDP 404). Uma coleção sem produtos publicáveis produz estado vazio visível.
- Limite e apresentação (grid, carrossel, paginação, carregar mais) são partilhados.

O bloco **Link** (`type_content` Product / Collection) liga CTAs internos (Hero, CTA banner, tabs, feature grid, pricing) a `product_page` ou `collection_page` pelo `shopify_handle`. Structured Text já resolvia estes modelos; o header (`navItemLink`) continua a ser um path em texto.

No **Feature GRID**, cada CARD tem `card_source`: editorial (título/imagem/CTA no bloco) ou produto/coleção. Catálogo preenche título (Dato), imagem e href (PDP/PLP) a partir da Storefront; produto mostra preço. Sem handle ou sem Storefront o card é omitido. Isto não substitui o Content listing.

Preço e imagem dos produtos continuam na Storefront. Não há links produto↔coleção no Dato.
