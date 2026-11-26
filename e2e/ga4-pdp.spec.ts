import { expect, test } from "@playwright/test";

/**
 * GA4 `view_item` / `add_to_cart` on a PT product page after consent, plus FAQPage and the
 * visible spec eyebrow in pt/en/es. Opt-in: needs Storefront, cart and a hydrated dev server.
 *
 *   npm run test:e2e:ga
 */
const HANDLE = "the-collection-snowboard-hydrogen";
const LOCALES = ["pt", "en", "es"] as const;

type GaCall = [string, string, { currency?: string; items?: { item_id?: string; item_name?: string; price?: number }[] }?];

test.describe("GA4 PDP events", () => {
  test.skip(process.env.E2E_SHOP !== "1", "E2E_SHOP=1 not set");

  test("fires view_item and add_to_cart in BRL after consent", async ({ page, context }) => {
    await page.addInitScript(() => {
      const calls: unknown[][] = [];
      (window as unknown as { __gaCalls: unknown[][] }).__gaCalls = calls;
      const record = (args: ArrayLike<unknown>) => {
        calls.push(Array.from(args));
      };
      let impl = (...args: unknown[]) => record(args);
      Object.defineProperty(window, "gtag", {
        configurable: true,
        enumerable: true,
        get: () => impl,
        set(fn: unknown) {
          impl = (...args: unknown[]) => {
            record(args);
            if (typeof fn === "function") return (fn as (...inner: unknown[]) => unknown)(...args);
          };
        },
      });
      const layer: unknown[] = [];
      const push = layer.push.bind(layer);
      layer.push = (...args: unknown[]) => {
        for (const arg of args) {
          if (arg && typeof arg === "object") {
            const list = Array.from(arg as ArrayLike<unknown>);
            if (list[0] === "event") record(list);
          }
        }
        return push(...args);
      };
      (window as unknown as { dataLayer: unknown[] }).dataLayer = layer;
    });

    await page.goto("/pt");
    const banner = page.getByRole("region", { name: "Cookies neste site" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Aceitar todos" }).click();
    await expect(banner).toBeHidden();
    expect((await context.cookies()).find((cookie) => cookie.name === "nd-consent")?.value).toBe("v1:granted");

    for (const locale of LOCALES) {
      await page.goto(`/${locale}/products/${HANDLE}`);
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      const eyebrow = heading.locator("xpath=following-sibling::p[1]");
      await expect(eyebrow).toBeVisible();
      await expect(eyebrow).toContainText(/\d+\/10/);
      const hasFaq = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
        nodes.some((node) => (node.textContent ?? "").includes("FAQPage")),
      );
      expect(hasFaq).toBe(true);
    }

    await page.goto(`/pt/products/${HANDLE}`);
    const addToCart = page.getByRole("button", { name: "Adicionar ao carrinho" }).first();
    await expect(addToCart).toBeEnabled({ timeout: 15_000 });
    await addToCart.click();
    await expect(page.getByRole("status")).toContainText("Adicionado ao carrinho.");

    const events = await page.evaluate(() => (window as unknown as { __gaCalls?: GaCall[] }).__gaCalls ?? []);
    for (const name of ["view_item", "add_to_cart"] as const) {
      const call = events.find((entry) => entry[0] === "event" && entry[1] === name);
      expect(call, name).toBeTruthy();
      const payload = call?.[2];
      expect(payload?.currency).toBe("BRL");
      expect(payload?.items?.[0]?.item_id).toBe(HANDLE);
      expect((payload?.items?.[0]?.item_name ?? "").trim().length).toBeGreaterThan(0);
      expect(payload?.items?.[0]?.price).toBeGreaterThan(0);
    }
  });
});
