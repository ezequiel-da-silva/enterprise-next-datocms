## Summary

<!-- What changed and why (1–3 sentences) -->

## Quality gates

See [docs/QUALITY-GATES.md](docs/QUALITY-GATES.md).

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (if UI/routes/layout touched)
- [ ] `npm run codegen` run and generated files committed (if GraphQL touched)

## Pillar review

- [ ] **Security** — no secrets; CSP/nonce respected; safe links (`security.mdc`)
- [ ] **Accessibility** — landmarks, focus, one h1, touch targets if UI changed
- [ ] **Performance** — image lazy/priority/sizes; minimal client JS
- [ ] **SEO** — metadata/canonical/noIndex if routes or pages changed
- [ ] **AEO** — JSON-LD correct if SEO/schema changed
- [ ] **Maintainability** — layer boundaries; `readCda*` / `resolve*` patterns
- [ ] **Testing** — unit tests for new pure logic

## Test plan

<!-- How a reviewer can verify -->
