import { test, expect } from "@playwright/test";

/**
 * Signed-out account page and the locale switcher on app routes. Needs the account flag
 * (`SHOPIFY_CART_ENABLED=1` + `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` + `SHOPIFY_CUSTOMER_SESSION_SECRET`);
 * fake values are enough because the sign-in link is never followed. Skipped when `/en/account` is 404.
 */
const ACCOUNT = [
  { locale: "en", title: "My account", signIn: "Sign in" },
  { locale: "pt", title: "Minha conta", signIn: "Entrar" },
  { locale: "es", title: "Mi cuenta", signIn: "Iniciar sesión" },
] as const;

test.describe("account", () => {
  test.beforeEach(async ({ request }) => {
    const res = await request.get("/en/account");
    test.skip(res.status() === 404, "customer account is disabled (flag or env missing)");
  });

  for (const { locale, title, signIn } of ACCOUNT) {
    test(`signed-out page in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/account`);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      const main = page.locator("main#conteudo-principal");
      await expect(main.getByRole("link", { name: signIn, exact: true })).toHaveAttribute(
        "href",
        `/api/account/login?locale=${locale}`,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });
  }

  test("locale switcher keeps /account", async ({ page }) => {
    await page.goto("/pt/account");
    await page.getByRole("button", { name: "Idioma: PT" }).first().click();
    await page.getByRole("link", { name: "Español", exact: true }).first().click();
    await expect(page).toHaveURL(/\/es\/account$/);
    await expect(page.getByRole("heading", { level: 1, name: "Mi cuenta" })).toBeVisible();
  });

  test("locale switcher keeps /cart", async ({ page, request }) => {
    const res = await request.get("/en/cart");
    test.skip(res.status() !== 200, "cart page unavailable");
    await page.goto("/en/cart");
    await page.getByRole("button", { name: "Language: EN" }).first().click();
    await page.getByRole("link", { name: "Português", exact: true }).first().click();
    await expect(page).toHaveURL(/\/pt\/cart$/);
    await expect(page.getByRole("heading", { level: 1, name: "Carrinho" })).toBeVisible();
  });
});
