/**
 * WCAG 2.5.3 Label in Name — accessible name must include the visible label text.
 * Dato `aria_label` placeholders like "Link ARIA" fail axe `label-content-name-mismatch`.
 */
export function accessibleNameIncludesVisible(accessibleName: string, visible: string): boolean {
  const name = accessibleName.normalize("NFKC").toLocaleLowerCase();
  const text = visible.normalize("NFKC").toLocaleLowerCase().trim();
  if (!text) return true;
  return name.includes(text);
}

/** Apply `aria-label` only when empty visible text or Label-in-Name holds. */
export function ariaLabelIfLabelInName(
  visibleText: string | null | undefined,
  ariaLabel: string | null | undefined,
): { "aria-label"?: string } {
  const aria = ariaLabel?.trim();
  if (!aria) return {};
  const visible = visibleText?.trim() ?? "";
  if (!visible || accessibleNameIncludesVisible(aria, visible)) {
    return { "aria-label": aria };
  }
  return {};
}
