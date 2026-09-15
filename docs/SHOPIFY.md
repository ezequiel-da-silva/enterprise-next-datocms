# Shopify — next-dato

O site **não** é a loja Shopify. A Shopify é a fonte de catálogo; o Dato guarda a ficha editorial; o Next renderiza o PDP.

Playbook Dato (modelo `product_page`, cache): [DATOCMS.md](./DATOCMS.md). Secrets / CSP: [SECURITY.md](./SECURITY.md). Variáveis: [`.env.example`](../.env.example).

## O que o site faz

```mermaid
flowchart LR
  ShopifyStore[Shopify loja]
  AppWebhook[App Dev Dashboard]
  NextShopify["POST /api/webhooks/shopify"]
  DatoCMA[Dato product_page]
  NextDato["POST /api/webhooks/datocms/product-page"]
  NextPDP["/{locale}/products/{handle}"]
  Storefront[Storefront API]

  ShopifyStore -->|"create: id handle title"| AppWebhook
  AppWebhook --> NextShopify
  NextShopify -->|"create: title + keys; update: só keys"| DatoCMA
  DatoCMA -->|"publish title en"| NextDato
  NextDato -->|productUpdate title| ShopifyStore
  DatoCMA -->|titulo editorial| NextPDP
  Storefront -->|preco stock imagem| NextPDP
```

| Peça | Papel |
|------|--------|
| App no **Dev Dashboard** | Client ID + chave secreta; **webhooks** assinados com essa chave |
| Canal **Headless** | Tokens da Storefront API (público + privado) |
| Dato `product_page` | Título editorial; `shopify_handle` + `shopify_product_id` (chaves Shopify) |
| Page de catálogo | Ligada em Global settings (`products_page`) |
| Next PDP | RSC: título Dato + Storefront no **servidor** |
| Dato → Shopify | Só `title` locale **en** → Admin `productUpdate` |

Fora de âmbito neste repo: `products/delete`, carrinho, checkout, `NEXT_PUBLIC_*` Shopify. Handle, preço, stock e imagem **não** vão do Dato para a Shopify.

## Duas superfícies Shopify (não misturar)

| Superfície | Onde | O que copias |
|------------|------|----------------|
| **Dev Dashboard** (`dev.shopify.com`) | App custom (ex. Automação DatoCMS) | `SHOPIFY_CLIENT_ID`, `SHOPIFY_API_SECRET_KEY`, Admin API (`write_products`) |
| **Admin da loja** | Canal de vendas **Headless** | `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (privado) |
| **Admin da loja** | Definições da loja | `SHOPIFY_STORE_DOMAIN` (`loja.myshopify.com`, sem `https://`) |
| **Admin da loja / app** | Token **Admin API** (servidor) | `SHOPIFY_ADMIN_ACCESS_TOKEN` — Dato → título Shopify |

A página de **instalação** do Headless (`…/app_installations/app/headless-storefronts`) **não** mostra tokens. Abre o canal (**Abrir app** ou pesquisa → Headless).

O HMAC do webhook usa a **chave secreta da app**. Tokens Storefront **não** assinam o webhook.

`SHOPIFY_CLIENT_ID` é obrigatório no env (app configurada). O cálculo HMAC **não** usa o Client ID — só `SHOPIFY_API_SECRET_KEY` no corpo cru.

## Variáveis (todas privadas)

Nunca `NEXT_PUBLIC_SHOPIFY_*`. Na Vercel: Environment Variables **sem** “Expose to the browser”, Production (e Preview se precisares), depois **redeploy**.

| Variável | Origem | Uso |
|----------|--------|-----|
| `SHOPIFY_CLIENT_ID` | Dev Dashboard → Configurações do app | Obrigatório; identidade da app |
| `SHOPIFY_API_SECRET_KEY` | Dev Dashboard → Chave secreta (`shpss_…`) | HMAC `x-shopify-hmac-sha256` |
| `SHOPIFY_STORE_DOMAIN` | Loja (`*.myshopify.com`) | Storefront URL + header `x-shopify-shop-domain` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Headless → API Storefront → **token privado** (`shpat_…`) | PDP: preço, stock, imagem |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | App (Admin API, scope `write_products`) | Dato → `productUpdate` do título. **Não** uses no browser |
| `DATOCMS_USER_REVIEWS_CDA_TOKEN` | Dato (token **CMA**) | Upsert de `product_page`. **Não** uses `DATOCMS_API_TOKEN` (CDA) |
| `DATOCMS_REVALIDATE_SECRET` | Dato webhook Bearer | `/api/revalidate` **e** `/api/webhooks/datocms/product-page` |
| `DATOCMS_ENVIRONMENT` | Dato | Escolhe o ambiente. Default **`main`**. `develop` = sandbox (fork). |

O cliente Storefront envia `Shopify-Storefront-Private-Token` se o valor começar por `shpat_`; senão `X-Shopify-Storefront-Access-Token` (token público hex). Preferir o **privado** no servidor.

## Passo a passo na Shopify

### 1. App no Dev Dashboard

1. [Dev Dashboard](https://dev.shopify.com) → a app instalada **nesta** loja.
2. Copia **ID do cliente** e **chave secreta** para `.env` / Vercel.
3. Scopes úteis (já na app se a criaste para catálogo): `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory` (Storefront via app) e o que for preciso para webhooks de produto.
4. Instala a app na loja de trabalho se ainda não estiver (1 instalação).

Não precisas de Admin access token permanente no Next.

### 2. Webhooks `products/create` e `products/update`

Fonte de verdade: [`shopify.app.toml`](../shopify.app.toml) na raiz. **Não** configures isto em Definições da loja → Notificações, **nem** em Project settings → Webhooks do Dato, **nem** no campo **URL do app** no Dev Dashboard.

| Onde | O quê |
|------|--------|
| `application_url` | Site: `https://enterprise-next-datocms.vercel.app` |
| `[[webhooks.subscriptions]]` | Tópicos + `uri` (relativo `/api/webhooks/shopify` ou URL absoluta HTTPS) |
| `[webhooks] api_version` | Formato do payload (ex. `2026-07`) |

O `link` pode reescrever a URI absoluta para o path relativo; a Shopify resolve contra `application_url`.

```bash
# Uma vez por clone (liga o repo à app Automação DatoCMS - NextJS)
npx shopify app config link --client-id "$SHOPIFY_CLIENT_ID"

# Sempre que mudares tópicos, URI ou scopes no toml
npx shopify app deploy
```

O ecrã **Criar versão** no Dashboard só cobre URL da app e versão da API. Sem `deploy` do TOML, guardar um produto na Shopify **não** chama o Next.

Webhooks em **Definições da loja → Notificações** usam **outro** signing secret → HMAC `401` com `SHOPIFY_API_SECRET_KEY`.

| Campo | Valor |
|-------|--------|
| URI | `/api/webhooks/shopify` (resolvido para `https://enterprise-next-datocms.vercel.app/api/webhooks/shopify`) |
| Tópicos | `products/create`, `products/update` |
| Formato | JSON |
| Versão da API | a do toml (`2026-07`) |

Local: `localhost` só com túnel HTTPS **e** essa URL no toml + `deploy`.

O endpoint exige HTTPS público. `localhost` só funciona atrás de um túnel (Cloudflare Tunnel, ngrok) **e** com essa URL registada na app.

A rota Shopify → Dato: HMAC do **corpo cru** → loja igual a `SHOPIFY_STORE_DOMAIN` → tópico produto → parse `id` / `handle` / `title` → CMA upsert + publish. **Create** preenche `title` nos 3 locales; **update** só `shopify_handle` + `shopify_product_id` (não sobrescreve o título editorial).

O webhook Dato **Next.js revalidate** (`POST /api/revalidate`) só invalida cache. O título Dato → Shopify é **outro** webhook (passo 4b).

Respostas Shopify: **500** env em falta; **401** HMAC, loja ou tópico inválidos; **400** JSON/payload; **200** `{ "success": true }`.

### 2b. Backfill dos produtos já existentes

As subscrições só disparam em **alterações futuras**. Produtos criados antes do `deploy` não entram sozinhos — ou os editas um a um na Shopify, ou corres o backfill:

```bash
npm run shopify:backfill -- --url https://enterprise-next-datocms.vercel.app --dry-run
npm run shopify:backfill -- --url https://enterprise-next-datocms.vercel.app
```

Lista os produtos pela Storefront API e reenvia cada um como webhook **assinado** para `/api/webhooks/shopify`. Mesmo caminho da Shopify, logo o mesmo upsert + publish — sem lógica CMA duplicada.

Só entram produtos publicados no canal **Headless** (a Storefront API não vê os outros). Corre-o depois do passo 3.

### 3. Canal Headless (Storefront)

1. Admin da loja → App Store → [Headless](https://apps.shopify.com/headless) → instalar.
2. Barra esquerda **Canais de vendas → Headless** (ou pesquisa). Não fiques na ficha de instalação.
3. **Criar vitrine** / Create storefront (instalar o canal **não** gera tokens).
4. **Gerenciar acesso à API → API Storefront**.
5. Copia o **token de acesso privado** (`shpat_…`) para `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
6. Publica os produtos no canal **Headless** (igual à Loja virtual). Sem isto a API autentica e o produto vem vazio.

### 3b. Plugin “Shopify product” no Dato (opcional)

Não faz parte do fluxo de sincronização — o webhook não precisa dele. Serve só para um editor **escolher** um produto num campo (pré-visualização com imagem e preço no editor).

| Campo do plugin | Valor |
|-----------------|--------|
| Use demo store? | desligado |
| **Shop ID** | **só o subdomínio**: `teste-datocms-ezequiel` (⚠️ não o `*.myshopify.com` completo) |
| Storefront access token | token **público** do canal Headless (hex). O privado `shpat_…` **não** serve: o plugin corre no browser |
| Auto-apply to fields | regex do API identifier, ex. `shopify_product` |

`The API key seems to be invalid for the specified Shopify domain!` é quase sempre o **Shop ID** com o domínio inteiro, ou um token privado onde tem de ser o público.

O `product_page` deste repo **não** tem campo `shopify_product` — tem `title`, `shopify_handle` e `shopify_product_id`. Handle e ID são chaves; o editor não deve alterá-los (fieldset **Shopify identifiers**). Se quiseres o seletor visual, cria um campo novo com API identifier `shopify_product`; não substituas `shopify_handle`.

### 4. Dato (já no schema deste repo)

- Modelo `product_page` (migrations `1789399000_productPageAndProductsPageLink.ts` + `1789401000_productPageShopifyKeyHints.ts`) no **main**.
- Singleton Global settings → `products_page` (link para a Page de catálogo).
- Token CMA (`DATOCMS_USER_REVIEWS_CDA_TOKEN`): Content Management API + Editor a escrever/publicar `product_page` (não só `user_review`).
- **`DATOCMS_ENVIRONMENT` escolhe o ambiente.** Produção e o destino normal: **`main`**. Para o sandbox: `DATOCMS_ENVIRONMENT=develop`.
- **Create** Shopify → Dato: `title` em `en`, `pt-BR` e `es`. **Update** Shopify → Dato: não reescreve `title` (preserva edições `pt-BR` / `es`).
- Handle não é localizado. URL do PDP: `/{locale}/products/{handle}`.
- Opcional no Dato: Configuration → Roles → Editor → `product_page`: permitir editar só `title` (handle e ID read-only). O token CMA do webhook continua a poder escrever as chaves.

### 4b. Dato → Shopify (só título `en`)

1. Na app Shopify: scope `write_products` em [`shopify.app.toml`](../shopify.app.toml) → `npx shopify app deploy` → **atualizar/reinstalar** a app na loja (scopes novos).
2. Gera um token **Admin API** (`SHOPIFY_ADMIN_ACCESS_TOKEN`) com `write_products`. Só no servidor / Vercel (nunca `NEXT_PUBLIC_*`).
3. **Project settings → Webhooks** (Dato) → **novo** webhook (não reutilizes o Next.js revalidate):
   - URL: `https://enterprise-next-datocms.vercel.app/api/webhooks/datocms/product-page`
   - Header: `Authorization` = `Bearer ` + `DATOCMS_REVALIDATE_SECRET`
   - Triggers: entity **Record** `product_page` — eventos **update** e **publish**
4. Publica um `product_page` com `title.en` diferente do título Shopify → a Admin Shopify deve atualizar. Se já for igual → `{ "success": true, "skipped": true }` (corta o eco do `products/update`).

`pt-BR` e `es` ficam só no Dato (o produto Shopify tem um único `title`).

## Vercel

1. Settings → Environment Variables.
2. As quatro `SHOPIFY_*` + `SHOPIFY_ADMIN_ACCESS_TOKEN` + `DATOCMS_USER_REVIEWS_CDA_TOKEN` + `DATOCMS_REVALIDATE_SECRET`. `DATOCMS_ENVIRONMENT` só se quiseres o sandbox (`develop`); senão o CMA usa `main`.
3. Production (e Preview).
4. Redeploy. Variável nova não entra no deploy já feito.

Local: as mesmas chaves no `.env` (nunca commitado).

**Não** configures `NODE_TLS_REJECT_UNAUTHORIZED` na Vercel, no Next, no `.env` da app, nem no CI. O site e o webhook **não** usam essa variável.

### CLI Shopify — TLS local (`self-signed certificate in certificate chain`)

Só o **Shopify CLI** (`npx shopify …`) no teu Mac, se um proxy/antivirus interceptar HTTPS para `accounts.shopify.com`. Não é setting do projeto.

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shopify app config link --client-id "$SHOPIFY_CLIENT_ID"
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shopify app deploy
```

Prefixo **só nesse comando**. Não exportes a variável no shell de forma permanente. O caminho certo a médio prazo é instalar o certificado da cadeia (ou desligar a inspeção TLS) — `REJECT_UNAUTHORIZED=0` desliga a verificação SSL.

`npx datocms`, `npm run dev`, testes e Vercel **não** precisam disto.

## Verificar

1. Cria um produto na Shopify → no Dato aparece `product_page` (handle + id + título), publicado.
2. Edita o título **só no Dato** (`en`) e publica → o título na Admin Shopify atualiza; `pt-BR`/`es` no Dato não mudam.
3. Edita o título **só na Shopify** num produto que já existe no Dato → o Dato **não** reescreve `title` (o PDP continua com o título Dato até o editor o mudar).
4. Abre `https://<site>/<locale>/products/<handle>`: título Dato; preço/imagem se o token Headless e a publicação no canal estiverem certos.
5. Logs Vercel: HMAC 401 → secret da **app** vs webhook da **loja**; 500 `missing` → env; produto sem preço → Headless / publicação no canal.

## Código

| Caminho | Função |
|---------|--------|
| `shopify.app.toml` | Versão da app + `write_products` + subscrições Shopify |
| `scripts/backfill-shopify-products.mjs` | Backfill (`npm run shopify:backfill`) |
| `src/app/api/webhooks/shopify/route.ts` | Shopify → Dato |
| `src/app/api/webhooks/datocms/product-page/route.ts` | Dato → título Shopify |
| `src/lib/shopify/hmac.ts` | HMAC SHA-256 Base64, `timingSafeEqual` |
| `src/lib/shopify/parse-product-webhook.ts` | Payload produto Shopify |
| `src/lib/datocms/parse-product-page-title-sync.ts` | Payload Dato `product_page` |
| `src/infra/datocms/sync-product-page.ts` | CMA upsert (title só no create) |
| `src/infra/shopify/admin-product-title.ts` | Admin GraphQL `productUpdate` |
| `src/infra/shopify/storefront.ts` | GraphQL Storefront `2024-07` |
| `src/app/[slug]/products/[handle]/page.tsx` | PDP |

Docs Shopify: [Storefront getting started](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started), [Get API access tokens](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens).
