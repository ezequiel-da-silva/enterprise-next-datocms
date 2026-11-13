---
name: ux-audit
description: >-
  Audit or design UI/flows in next-dato against the 32 UX laws (Jakob, Fitts,
  Hick, Peak-End, etc.). Use when creating or refactoring commercial pages,
  PDP/cart/wishlist chrome, heroes, listings, empty states, or cookie consent.
---

# UX audit (next-dato)

**Canonical laws:** [`.cursor/rules/ux-principles.mdc`](../../rules/ux-principles.mdc)  
**Visual close-out:** [docs/UI-CHECKLIST.md](../../../docs/UI-CHECKLIST.md)  
**Gates:** [docs/QUALITY-GATES.md](../../../docs/QUALITY-GATES.md)

## When to use

- New or redesigned surface in `src/components/` or `src/app/`
- Commercial landing / PDP / cart / wishlist / confirmation
- User asks for a UX audit of a page or flow

## Workflow

1. Read `ux-principles.mdc` (do not invent a parallel law list).
2. Map the screen: primary task, chrome, CTAs, loading/empty/error, Peak-End moments.
3. Apply only laws that fit; cite law names in findings.
4. Cross-check [UI-CHECKLIST.md](../../../docs/UI-CHECKLIST.md) (tokens, Container, type scale).
5. Prefer CMS + modular blocks + `scripts/setup-*.ts` over new App Router routes (**Occam**).
6. Load `ui_string` in `app/`; pass serializable props — never `get-*` from components.

## Review checklist (snowboard e-commerce)

| Check | Laws |
|-------|------|
| Logo left; wishlist + cart right | Jakob, Posição serial |
| Primary CTA filled; secondary outline | Von Restorff, Hick |
| Buy/chrome controls use `.touch-target` (≥48px) | Fitts |
| Featured/listing without gift-card/demo noise | Paradoxo da escolha, Foco no utilizador |
| Specs `<dl>` + size guide `<table>`/`<details>` when CMS has data | Miller, Prägnanz, GEO |
| Deck/base toggle on touch; Sold out / badge visible | Reconhecimento |
| Skeletons `aria-busy`; badges don’t cause CLS | Doherty, Acessibilidade |
| Cookie / trust / confirmation clear | Peak-End, Hick |
| Shipping/returns copy matches `market_policy` | Viés de confirmação, Consistência |

## Output shape

1. **Diagnóstico** (1–2 frases)  
2. **Manter** (com leis)  
3. **Atrito** — Problema · Impacto (Crítico/Alto/Médio) · Lei(s) · Solução prática  
4. **Proposta** — wireframe textual ou mudança mínima de props/componentes  

Do not rewrite the design system or invent purple gradients; stay on project tokens.
