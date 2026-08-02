---
name: pre-merge-quality
description: >-
  Run quality gates before commit or PR in next-dato. Use when finishing a
  feature, before creating a PR, or when the user asks to verify the branch
  is merge-ready.
---

# Pre-merge quality gates

Full checklist: [docs/QUALITY-GATES.md](../../docs/QUALITY-GATES.md)

## 1. Run commands (adapt to change scope)

**Always:**

```bash
npm run typecheck
npm test
npm run lint
```

**If `src/app/`, `src/components/`, layouts, or routes changed:**

```bash
npm run build
```

**If GraphQL or Dato schema fields changed:**

```bash
npm run codegen
git diff --exit-code src/infra/datocms/generated/  # no drift after codegen
```

**If `src/proxy.ts`, `src/app/api/`, security, or auth changed:**

```bash
npm run build && npm run start:prod   # terminal 1
NODE_ENV=production npm run security:headers   # terminal 2
# or: npm run security:check after build in CI-like env
```

**Full local gate:**

```bash
npm run check-all
```

## 2. Self-review pillars

| Pillar | Quick check |
|--------|-------------|
| Security | No secrets in diff; safe external links; nonce on scripts |
| A11y | One h1; landmarks; focus on new interactive UI |
| Perf | Image priority/lazy/sizes; no unnecessary `"use client"` |
| SEO | Metadata on new routes; canonical/noIndex correct |
| AEO | JSON-LD with nonce; async/sync JSON-LD pattern correct |
| Maintainability | Layer boundaries; minimal diff; readCda* used |
| Testing | New resolver logic has tests |

## 3. Known anti-patterns (block merge if present)

- Async Server Component inside sync parent without fix
- `error.tsx` rendering `<html>` or `<body>`
- `dynamic()` on Server Component ST blocks
- `SmartLink` in `Button asChild` without `tone="inherit"`
- Edited files under `generated/` without running codegen

## 4. PR

Use [.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md) and check all applicable boxes.
