# UI visual checklist

Use before closing a UI / CMS-block change. Rule: [`.cursor/rules/ui-visual.mdc`](../.cursor/rules/ui-visual.mdc). Tokens: [`src/config/theme.config.ts`](../src/config/theme.config.ts).

## Agent + Playwright MCP

When finishing a new or redesigned surface, run Playwright against `http://localhost:3000` (or the locale under test), capture **desktop 1440px** and **mobile 390px**, then answer:

1. **Surface stack** — Any node with `border` + `ring` + `shadow` (and/or `backdrop-blur`) together? Reduce to one outline (`border border-border` + `bg-card`) or remove the card.
2. **Type hierarchy** — Titles use `.type-display` / `.type-heading` (or equivalent `text-foreground` + `tracking-tight`)? Lead/body use `text-muted-foreground`, not muted titles?
3. **Headings** — One `h1` per page; section titles as `h2` (cards under a section heading may be `h3`).
4. **Width** — Content uses `<Container>` so side gutters align with the header logo row (no hand-rolled `max-w-* px-*` wrappers).
5. **Vertical rhythm** — Spacing matches neighbouring CMS blocks (`my-12` / existing section padding); no random tight `my-4` on new section roots.
6. **Viewports** — Screenshot at **1440** and **390**; cards that look fine on desktop must not collapse or overflow on mobile.
7. **LCP / hero** — Hero image still has `priority` / sensible `fetchPriority` where it is LCP; overlay text remains readable without stacking glass effects on the copy panel.

## Quick anti-patterns

| Avoid | Prefer |
|-------|--------|
| `rounded-3xl` + `shadow-xl` + `ring-1` + blur | `rounded-xl border border-border bg-card` |
| `bg-purple-*` / violet–indigo gradients | Semantic tokens only |
| Card around every text block | Gap / space-y grouping |
| Invented `max-w-6xl px-4 sm:px-6` | `<Container size="lg">` |
