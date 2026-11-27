# Quality Gates (next-dato)

Seven pillars agents and reviewers must verify before merge. Each pillar lists **commands**, **signals**, and **anti-patterns**.

## Quick command matrix

| Change type | Required commands |
|-------------|-------------------|
| Any TypeScript | `npm run typecheck` |
| Logic / resolvers | `npm test` |
| Any source | `npm run lint` |
| UI, routes, layout | `npm run build` |
| GraphQL / Dato schema | `npm run codegen` (queries) or `codegen:from-dato` (modelo Dato); `codegen:check` in CI (offline) |
| Security / proxy / API | `npm run security:check` |
| Full pre-merge | `npm run check-all` |

CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/security.yml`](../.github/workflows/security.yml). Required checks on protected branches: `quality`, `lighthouse (desktop)`, `lighthouse (mobile)`, `security`, `smoke`. Repo settings: [GITHUB.md](./GITHUB.md).

---

## 1. Security

**Pass when:**

- No secrets in code or commits (`.env` gitignored)
- CSP nonce on scripts, JSON-LD, inline theme CSS
- Draft/preview uses `isSecretEqual()`; redirects are relative only
- External links pass `isSafeExternalHref()`
- `target="_blank"` includes `rel="noopener noreferrer"`

**Commands:** `npm run security:check` (after production build)

**Anti-patterns:** Tokens in client bundle; `includeDrafts: true` by default; open redirect in draft API.

**Rule:** [`.cursor/rules/security.mdc`](../.cursor/rules/security.mdc)

---

## 2. Accessibility (a11y)

**Pass when:**

- Landmarks: `<header>`, `<main id="main-content">`, `<footer>`, labelled `<nav>`
- One `<h1>` per page
- Focus visible; mobile menu has focus trap + Escape
- Theme toggle: `role="switch"` + `aria-checked`
- Touch targets: `touch-target` / `touch-target-text` (≥44–48px) on chrome **and** purchase controls (ATC, cart steppers, drawer)
- Skeletons / deferred sections: `aria-busy="true"` where content is loading
- Forms: `Field` + `aria-describedby`; errors use `role="alert"`
- Links inside muted body copy are distinguishable without color alone (e.g. underline on `.structured-text a`)
- Contrast AA for `text-muted-foreground` on `background` / `card` (light + dark); avoid `opacity-*` on whole cards that dims price text

**Automated (axe, `e2e/a11y.spec.ts`):** WCAG 2.1 A/AA, fails on critical/serious for Home, PDP, contact, cart (empty) and account.

**Manual (Lighthouse / keyboard):** Tab order, `aria-expanded` on **menus** (not on `input type="search"` — searchbox forbids it; use `aria-controls` when the preview is open), no hover-only submenus.

**Anti-patterns:** Redundant `aria-label` matching visible text; submenu without keyboard support; `aria-expanded` on searchbox.

**Rules:** [`.cursor/rules/web-excellence.mdc`](../.cursor/rules/web-excellence.mdc) (A11y) · [`.cursor/rules/ux-principles.mdc`](../.cursor/rules/ux-principles.mdc)

---

## 3. Performance

**Pass when:**

- **LCP by surface:** home/CMS hero = Dato `priority` picture; PDP = Shopify gallery with `preload()` + `PDP_GALLERY_SIZES` + `decoding="sync"` (same srcset as `next/image`)
- Below-fold images: `loading="lazy"` + realistic `sizes`
- Dato images via `datocms-image-loader` (q=75, auto format)
- Preconnect: Dato/Mux with `crossorigin`; Shopify CDN **without** `crossorigin`
- Server Components by default; minimal client boundaries
- No `dynamic()` on Server Components in Structured Text blocks
- Hydrated badges (wishlist/cart from `localStorage`): reserve space / stable layout to avoid CLS
- CSS via external `/_next` links under prod CSP — `experimental.inlineCss` stays off ([SECURITY.md](./SECURITY.md))

**Measure:** `npm run build && npm run start:prod` — not `next dev` for Lighthouse. CI Lighthouse uses `start:standalone` ([`lighthouse.yml`](../.github/workflows/lighthouse.yml)); paths come from [`lighthouse-paths.cjs`](../lighthouse-paths.cjs) (home + PDP + PLP; override with `LHCI_PATHS`).

**Real users:** Vercel Speed Insights, after cookie consent (enable it in the Vercel dashboard; see `SPEED_INSIGHTS_ENABLED` in `.env.example`). Target at p75: LCP < 2.5 s, INP < 200 ms, CLS < 0.1. Server errors: filter Vercel Logs by `scope` / `level:error` ([SECURITY.md → Logs de erro](./SECURITY.md#logs-de-erro)).

**Anti-patterns:** Inflated `sizes="100vw"`; duplicate sticky headers; client-only theme boot; PDP gallery preload reused on home hero; `experimental.inlineCss` with nonce-only CSP.

---

## 4. SEO

**Pass when:**

- Metadata via `buildMetadata()` / `buildDatoPageMetadata()`
- Canonical from `getSiteBaseUrl()`; 404/search use `noIndex` where appropriate
- `sitemap.ts`, `robots.ts`, `manifest.ts` present and correct
- Title template in root layout

**Anti-patterns:** Hardcoded production URLs; missing canonical on indexable pages.

**Debugging the CI gate:** a Lighthouse SEO score of exactly **0.69** means the single failing audit is
`is-crawlable` (weight ~31% of the category) — the page carries a `noindex`. Sources, in order of
likelihood: the record's SEO field / DatoCMS global SEO, `buildUnavailableMetadata()` after a failed CMS
read, an `X-Robots-Tag` header, or a site-wide `Disallow: /` in `robots.txt`. The smoke step in
[`lighthouse.yml`](../.github/workflows/lighthouse.yml) fails first with the offending URL.

---

## 5. AEO / GEO (Answer & generative engines)

**Pass when:**

- JSON-LD uses `@context` + `@graph` with nonce (CSP-safe)
- Site graph: Organization, WebSite, SearchAction
- CMS pages: WebPage + BreadcrumbList where applicable
- FAQ blocks (`faq_group`): conditional FAQPage schema
- PDP: FAQPage from complete `product_page.questions` pairs (`buildProductPageJsonLd`); seed with `scripts/setup-product-qa.ts` when needed
- Visible breadcrumbs align with BreadcrumbList
- Product specs / size guide exposed as semantic HTML (`<dl>`, `<table>` / `<details>`), not image-only facts — crawlers and AEO can read them

**Anti-patterns:** Async `JsonLdScript` inside sync ST block parent; JSON-LD without nonce; specs only as a JPG.

**Skill:** [`.cursor/skills/seo-aeo-feature/SKILL.md`](../.cursor/skills/seo-aeo-feature/SKILL.md) · UX: [`.cursor/rules/ux-principles.mdc`](../.cursor/rules/ux-principles.mdc)

---

## 6. Maintainability

**Pass when:**

- Changes follow layer boundaries ([ARCHITECTURE.md](./ARCHITECTURE.md))
- CMS fields read via `readCdaBool/String/Array` (camel + snake)
- Optional CMS config via `resolve*Options()` with documented defaults
- Block naming: `{Name}Block`; tests colocated as `*.test.ts`
- Diff is minimal and focused on the task

**Anti-patterns:** New helpers for one-liners; duplicating GraphQL only in one file; editing generated types.

**Rule:** [`.cursor/rules/architecture.mdc`](../.cursor/rules/architecture.mdc)

---

## 7. Testing

**Pass when:**

- Vitest covers parsers, resolvers, link-block, JSON-LD builders
- Tests cover snake_case and camelCase CMS field aliases where relevant
- `npm test` passes in CI
- Playwright on PRs (`npm run test:e2e` → job `smoke`): `e2e/smoke.spec.ts` (home, blog, draft auth, contact honeypot `opacity: 0` on `company_website`), plus `a11y.spec.ts`, `consent.spec.ts`, and `account.spec.ts` (account skips when Customer Account is disabled)
- Opt-in (not CI): `npm run test:e2e:shop` / catalog filters (`E2E_SHOP=1`), `npm run test:e2e:ga` (`ga4-pdp.spec.ts`), `E2E_AUDIT_PT=1` screenshots — need Storefront + `.env.prod` where noted
- No trivial snapshot tests unless explicitly requested

**Anti-patterns:** Testing implementation details; skipping tests for new `resolve-*` helpers.

**Rule:** [`.cursor/rules/testing.mdc`](../.cursor/rules/testing.mdc)
**E2E:** [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)

---

## PR checklist (copy-paste)

```markdown
- [ ] typecheck + test + lint pass locally
- [ ] build passes (if UI/routes touched)
- [ ] codegen run (if GraphQL touched; `codegen:from-dato` if Dato model changed)
- [ ] security:check (if proxy/API/auth touched)
- [ ] Security: no secrets, safe links, CSP nonce respected
- [ ] A11y: landmarks, focus, one h1, touch targets ≥48px, contrast, skeletons `aria-busy`
- [ ] Perf: lazy/priority images, minimal client JS, no CLS on wishlist/cart badges
- [ ] SEO/AEO/GEO: metadata + JSON-LD; semantic specs/size guide when present
- [ ] UX: primary CTA hierarchy; no demo SKUs in featured; `ux-principles` / UI-CHECKLIST
- [ ] Maintainability: layer boundaries, readCda* / resolve* patterns; ui_string via app props
- [ ] Tests added/updated for new pure logic
```

## Lighthouse ATF (interactive UI)

When shipping nav, dialogs, or forms:

- Tab through all controls; logical order
- `aria-expanded` / `aria-checked` reflect state
- Dialog traps focus; Escape closes; focus returns to trigger
- Landmarks present in accessibility tree
- UX close-out: [UI-CHECKLIST.md](./UI-CHECKLIST.md) + [`.cursor/rules/ux-principles.mdc`](../.cursor/rules/ux-principles.mdc)
