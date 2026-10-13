import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/** Cookie consent banner: shown until a choice, persisted in `nd-consent`, reopenable from the footer. */
function banner(page: Page) {
  return page.getByRole("region", { name: "Cookies on this site" });
}

async function consentCookie(context: BrowserContext) {
  return (await context.cookies()).find((c) => c.name === "nd-consent")?.value;
}

test.describe("cookie consent", () => {
  test("accept all hides the banner and persists after reload", async ({ page, context }) => {
    const trackerRequests: string[] = [];
    page.on("request", (req) => {
      if (/googletagmanager\.com|google-analytics\.com/.test(req.url())) trackerRequests.push(req.url());
    });

    await page.goto("/en");
    await expect(banner(page)).toBeVisible();
    expect(trackerRequests).toEqual([]);

    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect(banner(page)).toBeHidden();
    expect(await consentCookie(context)).toBe("v1:granted");

    await page.reload();
    await expect(page.locator("main#conteudo-principal")).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
  });

  test("reject non-essential stores a denial", async ({ page, context }) => {
    await page.goto("/en");
    await banner(page).getByRole("button", { name: "Reject non-essential" }).click();
    await expect(banner(page)).toBeHidden();
    expect(await consentCookie(context)).toBe("v1:denied");
  });

  test("footer preferences reopen the banner and focus it", async ({ page }) => {
    await page.goto("/en");
    await banner(page).getByRole("button", { name: "Reject non-essential" }).click();
    await page.getByRole("button", { name: "Cookie preferences" }).click();
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("heading", { name: "Cookies on this site" })).toBeFocused();
  });

  test("is translated", async ({ page }) => {
    await page.goto("/pt");
    const region = page.getByRole("region", { name: "Cookies neste site" });
    await expect(region.getByRole("button", { name: "Aceitar todos" })).toBeVisible();
    await expect(region.getByRole("button", { name: "Rejeitar não essenciais" })).toBeVisible();
  });
});
