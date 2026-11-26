# UI visual checklist

Use before closing a UI / CMS-block change. Rules: [`.cursor/rules/ui-visual.mdc`](../.cursor/rules/ui-visual.mdc) (tokens/surfaces) and [`.cursor/rules/ux-principles.mdc`](../.cursor/rules/ux-principles.mdc) (cognitive UX). Skill: [`.cursor/skills/ux-audit/SKILL.md`](../.cursor/skills/ux-audit/SKILL.md). Tokens: [`src/config/theme.config.ts`](../src/config/theme.config.ts).

## Agent + Playwright MCP

When finishing a new or redesigned surface, run Playwright against `http://localhost:3000` (or the locale under test), capture **desktop 1440px** and **mobile 390px**, then answer:

1. **Surface stack** — Any node with `border` + `ring` + `shadow` (and/or `backdrop-blur`) together? Reduce to one outline (`border border-border` + `bg-card`) or remove the card.
2. **Type hierarchy** — Titles use `.type-display` / `.type-heading` (or equivalent `text-foreground` + `tracking-tight`)? Lead/body use `text-muted-foreground`, not muted titles?
3. **Headings** — One `h1` per page; section titles as `h2` (cards under a section heading may be `h3`).
4. **Width** — Content uses `<Container>` so side gutters align with the header logo row (no hand-rolled `max-w-* px-*` wrappers).
5. **Vertical rhythm** — Spacing matches neighbouring CMS blocks (`my-12` / existing section padding); no random tight `my-4` on new section roots.
6. **Viewports** — Screenshot at **1440** and **390**; cards that look fine on desktop must not collapse or overflow on mobile.
7. **LCP** — Home/CMS: hero `DatoResponsivePicture` with `priority` where it is LCP; overlay text readable without stacking glass on the copy panel. PDP: gallery image uses matching `preload()` + `decoding="sync"` (not the hero block pattern).

## Quick anti-patterns

| Avoid | Prefer |
|-------|--------|
| `rounded-3xl` + `shadow-xl` + `ring-1` + blur | `rounded-xl border border-border bg-card` |
| `bg-purple-*` / violet–indigo gradients | Semantic tokens only |
| Card around every text block | Gap / space-y grouping |
| Invented `max-w-6xl px-4 sm:px-6` | `<Container size="lg">` |

## UX close-out

Also run the short checklist at the bottom of [`ux-principles.mdc`](../.cursor/rules/ux-principles.mdc) (Jakob chrome, one primary CTA, touch targets, contrast/links, empty/loading, semantic specs, policy copy vs `market_policy`).
