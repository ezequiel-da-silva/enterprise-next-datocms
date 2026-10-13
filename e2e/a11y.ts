import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING_IMPACTS = new Set(["critical", "serious"]);

/** Fails on critical/serious WCAG 2.1 A/AA violations only; moderate/minor are left to audits. */
export async function expectNoSeriousA11yViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const blocking = violations.filter((v) => v.impact && BLOCKING_IMPACTS.has(v.impact));
  const report = blocking
    .map(
      (v) =>
        `[${v.impact}] ${v.id}: ${v.help} (${v.helpUrl})\n` +
        v.nodes.map((n) => `  - ${n.target.join(" ")}`).join("\n"),
    )
    .join("\n\n");
  expect(blocking, report).toEqual([]);
}
