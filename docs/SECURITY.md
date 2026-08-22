# Segurança — next-dato

Guia operacional para validar CSP, headers HTTP, dependências e rotas sensíveis. Regras do projeto: [`.cursor/rules/security.mdc`](../.cursor/rules/security.mdc).

## Scripts npm

| Script | O que faz |
|--------|-----------|
| `npm run security:audit` | `npm audit --omit=dev` — falha em vulnerabilidades **high**/**critical** no código **enviado para produção** |
| `npm run security:audit:all` | `npm audit` na árvore completa (inclui devDependencies) — informativo |
| `npm run security:headers` | Valida headers em `GET /` e smoke tests em `/api/draft` |
| `npm run security:check` | Audit + headers (headers exigem servidor a correr) |

### Por que o audit é `--omit=dev`

O gate ([`security:audit`](../package.json)) cobre apenas dependências de produção — é o que corre no browser/servidor. As `devDependencies` (Lighthouse CI, Playwright, codegen) não são enviadas para produção e geram ruído sem correção a montante.

Caso concreto: `@lhci/cli` → `lighthouse` → `puppeteer-core` → `@puppeteer/browsers` → `extract-zip` ([GHSA-jmr9-qjv8-65gv](https://github.com/advisories/GHSA-jmr9-qjv8-65gv), symlink path traversal). O `extract-zip@2.0.1` é a **última versão publicada** e ainda é a afetada — não há upgrade que resolva, e `npm audit fix --force` só faria downgrade do `@lhci/cli` (breaking). Na prática, o `extract-zip` só descompacta o download oficial do Chrome for Testing (Google) durante a instalação do browser no CI — origem confiável, sem input de terceiros.

Corre `npm run security:audit:all` periodicamente para reavaliar; quando houver `extract-zip` corrigido (ou `@puppeteer/browsers`/`@lhci/cli` que o adote), promover para o gate ou adicionar `override`.

### Headers e API (local)

O proxy em [`src/proxy.ts`](../src/proxy.ts) aplica CSP estrita e HSTS só quando o processo do Next corre com **`NODE_ENV=production`**.

```bash
npm run build
npm run start:prod
```

Pare qualquer `next dev` na mesma porta antes de testar headers.

Noutro terminal:

```bash
# Opcional: mesmo secret que no .env para testes 401/422 completos
export DATOCMS_PREVIEW_SECRET=preview-secret
export SECURITY_BASE_URL=http://127.0.0.1:3000
NODE_ENV=production npm run security:headers
```

Variáveis úteis:

- `SECURITY_BASE_URL` — default `http://127.0.0.1:3000`
- `SECURITY_TIMEOUT_MS` — default `10000`
- `DATOCMS_PREVIEW_SECRET` / `SECURITY_TEST_SECRET` — testes de draft com secret inválido e open redirect

### Copiar variáveis de ambiente

```bash
cp .env.example .env
# Preencher tokens DatoCMS — nunca commitar .env
```

## CI (GitHub Actions)

Permissões do `GITHUB_TOKEN` (Release Please) e proteção de branches: [GITHUB.md](./GITHUB.md). Secrets DatoCMS abaixo.

Workflow: [`.github/workflows/security.yml`](../.github/workflows/security.yml)

1. `npm run security:audit`
2. `npm run build` (requer rede; recomenda-se secret `DATOCMS_API_TOKEN` no repositório)
3. `npm run start` em background
4. `npm run security:headers` com `NODE_ENV=production`

Secrets opcionais no GitHub (**Settings → Secrets and variables → Actions**):

| Secret | Uso |
|--------|-----|
| `DATOCMS_API_TOKEN` | Build/SSG com dados reais do CMS |
| `DATOCMS_DRAFT_CDA_TOKEN` | Se o build precisar de rascunhos |
| `DATOCMS_PREVIEW_SECRET` | Smoke tests 401/422 no draft (CI usa fallback se ausente) |

## Ferramentas externas (staging / produção)

Com HTTPS e domínio público:

- [Mozilla Observatory](https://observatory.mozilla.org/)
- [securityheaders.com](https://securityheaders.com/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) — colar o header `Content-Security-Policy` da resposta
- [SSL Labs](https://www.ssllabs.com/ssltest/) — TLS do hosting
- [OWASP ZAP](https://www.zaproxy.org/) — varredura dinâmica (localhost ou staging)

## Checklist manual

- [ ] Lighthouse **Best Practices** e **Security** em `npm run build && npm run start` (não em `next dev`)
- [ ] Console sem violações de CSP em páginas principais (FA com CSS estático; sem `<style>` injectado sem nonce)
- [ ] Produção: `style-src-elem` com nonce; `style-src-attr` permite atributos (next/image)
- [ ] `/api/draft` sem secret → 401 ou 500 (nunca preview aberto)
- [ ] `/api/draft?secret=wrong` → 401 quando secret configurado
- [ ] `/api/draft?secret=…&redirect=https://evil.com` → 422
- [ ] Formulário `/contato`: honeypot `company_website` preenchido → sucesso genérico, sem leak
- [ ] Links externos do CMS com `javascript:` não renderizam (`isSafeExternalHref`)
- [ ] Tokens Dato **não** aparecem no bundle do browser (DevTools → Sources)
- [ ] `.env` fora do git; produção com secrets no painel do host

## Limitações

- `npm audit` não cobre SAST nem lógica de negócio (rate limit, abuse de Server Actions).
- O gate (`security:audit`) usa `--omit=dev`: não vigia devDependencies. Rever com `security:audit:all` antes de releases.
- HSTS em localhost não implica TLS real — validar SSL no deploy.
- CORS `*` em `/api/preview-links` é intencional para o plugin DatoCMS — não replicar em APIs novas.
