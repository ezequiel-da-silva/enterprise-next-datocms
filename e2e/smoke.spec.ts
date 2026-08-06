import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("home page renders primary heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("main#conteudo-principal")).toBeVisible();
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

  test("contact page exposes honeypot field off-screen", async ({ page }) => {
    await page.goto("/contato");
    await expect(page.getByRole("heading", { name: /contato/i })).toBeVisible();
    const honeypot = page.locator('input[name="company_website"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toBeHidden();
  });
});
