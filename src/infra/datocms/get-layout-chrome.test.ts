import { describe, expect, it } from "vitest";
import { sliceChromeNavigation, sliceChromeSiteSeo } from "./get-layout-chrome";

describe("layout chrome slices", () => {
  it("forwards GraphQL errors without inventing data", () => {
    const errors = { errors: [{ message: "quota" }] };
    expect(sliceChromeNavigation(errors)).toEqual(errors);
    expect(sliceChromeSiteSeo(errors)).toEqual(errors);
  });

  it("picks navigation and site SEO from the combined payload", () => {
    const result = {
      data: {
        navigation: {
          logo: null,
          menuLinks: [],
          showThemeToggle: false,
          footerLogo: null,
          footerMenu: [],
          socialLinks: [],
          copyrightText: null,
          legalLinks: [],
        },
        _site: { globalSeo: { siteName: "Kit" } },
      },
    };
    const slicedNav = sliceChromeNavigation(result);
    const slicedSeo = sliceChromeSiteSeo(result);
    if ("errors" in slicedNav || "errors" in slicedSeo) {
      throw new Error("expected data");
    }
    expect(slicedNav.data.navigation?.showThemeToggle).toBe(false);
    expect(slicedSeo.data._site.globalSeo?.siteName).toBe("Kit");
  });
});
