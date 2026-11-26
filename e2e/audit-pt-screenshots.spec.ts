import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Visual audit captures for `/pt` (mega-menu, Buy Box BR, cart drawer).
 * Opt-in — needs Storefront + cart + running app:
 *
 *   npm run test:e2e:audit-pt
 *
 * Screenshots land in `playwright-report/audit-pt/` (gitignored via playwright-report/).
 */
test.describe("audit pt screenshots", () => {
  test.skip(process.env.E2E_AUDIT_PT !== "1", "E2E_AUDIT_PT=1 not set");

  const OUT_DIR = path.join(process.cwd(), "playwright-report", "audit-pt");
  const PRODUCTS = [
    "/pt/products/the-collection-snowboard-hydrogen",
    "/pt/products/the-collection-snowboard-liquid",
  ] as const;

  const VIEWPORTS = [
    { name: "desktop", size: { width: 1280, height: 800 } },
    { name: "mobile", size: { width: 390, height: 844 } },
  ] as const;

  test.beforeAll(() => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  async function grantConsent(page: Page) {
    const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    await page.context().addCookies([
      {
        name: "nd-consent",
        value: "v1:granted",
        url: base,
      },
    ]);
  }

  async function shot(page: Page, name: string) {
    const file = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    return file;
  }

  async function addToCartButton(page: Page) {
    const cartButton = page.getByRole("button", { name: /^(Adicionar ao carrinho|Esgotado)$/ });
    try {
      await cartButton.first().waitFor({ timeout: 15_000 });
    } catch {
      return null;
    }
    const button = page.getByRole("button", { name: "Adicionar ao carrinho" }).first();
    return (await button.count()) > 0 && (await button.isEnabled()) ? button : null;
  }

  async function openPdpWithStock(page: Page) {
    for (const href of PRODUCTS) {
      await page.goto(href);
      await expect(page.locator("main#main-content")).toBeVisible();
      const button = await addToCartButton(page);
      if (button) return { href, button };
    }
    return null;
  }

  for (const vp of VIEWPORTS) {
    test(`captures home mega, pdp buy box, cart drawer (${vp.name})`, async ({ page }) => {
      await page.setViewportSize(vp.size);
      const isMobile = vp.name === "mobile";

      // --- A: Home + mega-menu + footer ---
      await grantConsent(page);
      await page.goto("/pt");
      await expect(page.locator("main#main-content")).toBeVisible();
      await expect(page.locator("[data-cookie-consent]")).toHaveCount(0);

      if (isMobile) {
        const menuBtn = page.getByRole("button", { name: "Abrir menu" });
        await expect(menuBtn).toBeVisible();
        await menuBtn.click();
        // Label flips to "Fechar menu" when open.
        await expect(page.getByRole("button", { name: "Fechar menu" })).toBeVisible({ timeout: 10_000 });
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible({ timeout: 10_000 });
        const loja = dialog.getByRole("button", { name: /^Loja$/i });
        await expect(loja).toBeVisible();
        await loja.click();
        await expect(loja).toHaveAttribute("aria-expanded", "true");
        await expect(dialog.getByText(/Nível|Terreno|Coleç/i).first()).toBeVisible({ timeout: 10_000 });
        await shot(page, `home-mega-${vp.name}`);
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
      } else {
        const loja = page.locator("header").getByRole("button", { name: /^Loja$/i });
        await expect(loja).toBeVisible();
        // Desktop mega: focus opens via onFocusCapture; keep pointer over the control for the shot.
        await loja.focus();
        await loja.hover();
        await expect(loja).toHaveAttribute("aria-expanded", "true", { timeout: 10_000 });
        await expect(page.getByText("Nível").first()).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText("Terreno").first()).toBeVisible();
        await expect(page.getByText(/Coleções|Coleç/i).first()).toBeVisible();
        await shot(page, `home-mega-${vp.name}`);
        // Move pointer away so mouseleave closes the mega (avoid sticky header intercepting main clicks).
        await page.mouse.move(0, 0);
      }

      const footer = page.locator("footer");
      await footer.scrollIntoViewIfNeeded();
      const footerHrefs = await footer.locator("a[href]").evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).href.toLowerCase()),
      );
      expect(
        footerHrefs.some((h) => h.includes("github") || h.includes("google.com")),
        "footer must not link to github/google placeholders",
      ).toBe(false);
      await shot(page, `footer-${vp.name}`);

      // --- B: PDP Buy Box BR ---
      const pdp = await openPdpWithStock(page);
      test.skip(!pdp, "sem produto disponível (hydrogen/liquid) com ATC");

      const cepInput = page.getByPlaceholder("00000-000");
      await expect(cepInput).toBeVisible({ timeout: 15_000 });
      await cepInput.fill("01310-100");
      await page.getByRole("button", { name: "Calcular" }).click();
      await expect(page.getByText(/Prazo:|R\$|frete/i).first()).toBeVisible({ timeout: 20_000 });

      await expect(page.getByText(/Art\.?\s*49|90 dias/i).first()).toBeVisible();
      await expect(page.locator('[data-ui-section="CheckoutTrustStrip"]')).toBeVisible();
      await expect(page.getByRole("link", { name: "Ver especificações" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Guia de tamanhos" })).toBeVisible();

      const buyBox = page.locator('[data-ui-section="CheckoutTrustStrip"]').locator("xpath=ancestor::div[contains(@class,\"space-y\")][1]");
      await buyBox.first().scrollIntoViewIfNeeded().catch(() => undefined);
      await shot(page, `pdp-buybox-${vp.name}`);

      const specs = page.locator("#product-specs");
      if ((await specs.count()) > 0) {
        await specs.scrollIntoViewIfNeeded();
      } else {
        await page.getByRole("link", { name: "Ver especificações" }).click();
      }
      const sizeGuide = page.locator("#product-size-guide");
      if ((await sizeGuide.count()) > 0) {
        await sizeGuide.scrollIntoViewIfNeeded();
      }
      const verified = page.getByText(/Rider verificado|Verificado/i);
      if ((await verified.count()) > 0) {
        await verified.first().scrollIntoViewIfNeeded();
      }
      await shot(page, `pdp-specs-${vp.name}`);

      // --- C: Cart drawer ---
      await pdp!.button.scrollIntoViewIfNeeded();
      await pdp!.button.click();
      const drawer = page.getByRole("dialog");
      await expect(drawer).toBeVisible({ timeout: 15_000 });
      await expect(drawer.getByRole("heading", { name: "Carrinho" })).toBeVisible();

      const meter = drawer.locator("[data-free-shipping-progress]");
      const meterCount = await meter.count();
      if (meterCount === 0) {
        test.info().annotations.push({
          type: "note",
          description: "FreeShippingMeter hidden (flat free / no threshold) — screenshot still taken",
        });
      } else {
        await expect(meter.first()).toBeVisible();
      }

      await expect(drawer.getByRole("link", { name: "Finalizar compra" })).toBeVisible();
      await expect(drawer.locator('[data-ui-section="CheckoutTrustStrip"]')).toBeVisible();

      await shot(page, `cart-drawer-${vp.name}`);
    });
  }
});
