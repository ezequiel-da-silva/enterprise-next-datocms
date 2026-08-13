import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("root redirects to default locale home", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator("main#conteudo-principal")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("blog index renders for default locale", async ({ page }) => {
    await page.goto("/en/blog");
    await expect(page.getByRole("heading", { name: "Blog", level: 1 })).toBeVisible();
  });

  test("draft API rejects unauthenticated enable", async ({ request }) => {
    const res = await request.get("/api/draft");
    expect([401, 500]).toContain(res.status());
  });

  test("draft API rejects absolute redirect", async ({ request }) => {
    const secret = process.env.DATOCMS_PREVIEW_SECRET?.trim();
    test.skip(!secret, "DATOCMS_PREVIEW_SECRET not set");

    const res = await request.get(
      `/api/draft?secret=${encodeURIComponent(secret!)}&redirect=${encodeURIComponent("https://evil.example")}`,
    );
    expect(res.status()).toBe(422);
  });

  test("contact page keeps honeypot out of reach of users", async ({ page }) => {
    await page.goto("/contato");
    await expect(page.getByRole("heading", { name: /contato/i, level: 1 })).toBeVisible();

    const honeypot = page.locator('input[name="company_website"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveCSS("opacity", "0");

    await expect(page.getByRole("textbox", { name: /não preencha/i })).toHaveCount(0);
  });

  test("mobile menu closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
