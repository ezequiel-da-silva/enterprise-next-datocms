# Quality Gates (next-dato)

Seven pillars agents and reviewers must verify before merge. Each pillar lists **commands**, **signals**, and **anti-patterns**.

## Quick command matrix

| Change type | Required commands |
|-------------|-------------------|
| Any TypeScript | `npm run typecheck` |
| Logic / resolvers | `npm test` |
| Any source | `npm run lint` |
| UI, routes, layout | `npm run build` |
| GraphQL / Dato schema | `npm run codegen` (+ `npm run codegen:check` in CI) |
| Security / proxy / API | `npm run security:check` |
| Full pre-merge | `npm run check-all` |

CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/security.yml`](../.github/workflows/security.yml).

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

- Landmarks: `<header>`, `<main id="conteudo-principal">`, `<footer>`, labelled `<nav>`
- One `<h1>` per page
- Focus visible; mobile menu has focus trap + Escape
- Theme toggle: `role="switch"` + `aria-checked`
- Touch targets: `touch-target` / `touch-target-text` on header controls
- Forms: `Field` + `aria-describedby`; errors use `role="alert"`

**Manual (Lighthouse / keyboard):** Tab order, `aria-expanded` on menus, no hover-only submenus.

**Anti-patterns:** Redundant `aria-label` matching visible text; submenu without keyboard support.

**Rule:** [`.cursor/rules/web-excellence.mdc`](../.cursor/rules/web-excellence.mdc) (A11y section)

---

## 3. Performance

**Pass when:**

- LCP image uses `priority` / `fetchPriority="high"` only where needed
- Below-fold images: `loading="lazy"` + realistic `sizes`
- Dato images via `datocms-image-loader` (q=75, auto format)
- Server Components by default; minimal client boundaries
- No `dynamic()` on Server Components in Structured Text blocks

**Measure:** `npm run build && npm run start` — not `next dev` for Lighthouse.

**Anti-patterns:** Inflated `sizes="100vw"`; duplicate sticky headers; client-only theme boot.

---

## 4. SEO

**Pass when:**

- Metadata via `buildMetadata()` / `buildDatoPageMetadata()`
- Canonical from `getSiteBaseUrl()`; 404/search use `noIndex` where appropriate
- `sitemap.ts`, `robots.ts`, `manifest.ts` present and correct
- Title template in root layout

**Anti-patterns:** Hardcoded production URLs; missing canonical on indexable pages.

---

## 5. AEO (Answer Engine Optimization)

**Pass when:**

- JSON-LD uses `@context` + `@graph` with nonce (CSP-safe)
- Site graph: Organization, WebSite, SearchAction
- CMS pages: WebPage + BreadcrumbList where applicable
- FAQ blocks: conditional FAQPage schema
- Visible breadcrumbs align with BreadcrumbList

**Anti-patterns:** Async `JsonLdScript` inside sync ST block parent; JSON-LD without nonce.

**Skill:** [`.cursor/skills/seo-aeo-feature/SKILL.md`](../.cursor/skills/seo-aeo-feature/SKILL.md)

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
- Playwright smoke (`npm run test:e2e`) on PRs — home, blog, draft auth, contact honeypot
- No trivial snapshot tests unless explicitly requested

**Anti-patterns:** Testing implementation details; skipping tests for new `resolve-*` helpers.

**Rule:** [`.cursor/rules/testing.mdc`](../.cursor/rules/testing.mdc)
**E2E:** [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)

---

## PR checklist (copy-paste)

```markdown
- [ ] typecheck + test + lint pass locally
- [ ] build passes (if UI/routes touched)
- [ ] codegen run (if GraphQL touched)
- [ ] security:check (if proxy/API/auth touched)
- [ ] Security: no secrets, safe links, CSP nonce respected
- [ ] A11y: landmarks, focus, one h1, touch targets
- [ ] Perf: lazy/priority images, minimal client JS
- [ ] SEO/AEO: metadata + JSON-LD if page/block SEO impact
- [ ] Maintainability: layer boundaries, readCda* / resolve* patterns
- [ ] Tests added/updated for new pure logic
```

## Lighthouse ATF (interactive UI)

When shipping nav, dialogs, or forms:

- Tab through all controls; logical order
- `aria-expanded` / `aria-checked` reflect state
- Dialog traps focus; Escape closes; focus returns to trigger
- Landmarks present in accessibility tree
