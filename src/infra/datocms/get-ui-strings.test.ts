import { beforeEach, describe, expect, it, vi } from "vitest";

const datocmsFetch = vi.fn();
vi.mock("@/infra/datocms/client", () => ({ datocmsFetch: (...args: unknown[]) => datocmsFetch(...args) }));
vi.mock("@/infra/observability/log-error", () => ({ logWarnThrottled: vi.fn(), logError: vi.fn() }));

import { getAccountCopy, getCartCopy, getConsentCopy } from "@/infra/datocms/get-ui-strings";
import { GET_UI_STRINGS } from "@/infra/datocms/ui-strings-query";
import { CART_COPY } from "@/lib/i18n/cart-copy";
import { CONSENT_COPY } from "@/lib/i18n/consent-copy";
import { UI_STRINGS_FIELD_NAMES } from "@/lib/i18n/ui-strings-fields";

beforeEach(() => {
  datocmsFetch.mockReset();
});

describe("GET_UI_STRINGS", () => {
  it("selects every mapped field and does not use fallback locales", () => {
    for (const name of UI_STRINGS_FIELD_NAMES) expect(GET_UI_STRINGS).toContain(name);
    expect(GET_UI_STRINGS).not.toContain("fallbackLocales");
  });
});

describe("get-ui-strings", () => {
  it("returns the built-in copy when the CMS errors", async () => {
    datocmsFetch.mockResolvedValue({ errors: [{ message: "Field 'uiString' doesn't exist" }] });
    expect(await getConsentCopy("pt")).toEqual(CONSENT_COPY.pt);
    expect((await getCartCopy("en")).checkout).toBe(CART_COPY.en.checkout);
  });

  it("returns the built-in copy when the singleton is empty", async () => {
    datocmsFetch.mockResolvedValue({ data: { uiString: null } });
    expect(await getConsentCopy("es")).toEqual(CONSENT_COPY.es);
  });

  it("overlays CMS values for the requested locale", async () => {
    datocmsFetch.mockResolvedValue({
      data: { uiString: { cookiesTitle: "Privacidade", cartLinkLabelOne: "x", accountGreeting: "Oi, {name}" } },
    });
    expect((await getConsentCopy("pt")).title).toBe("Privacidade");
    expect((await getAccountCopy("pt")).greeting("Ana")).toBe("Oi, Ana");
    expect(datocmsFetch).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { locale: "pt_BR" } }),
    );
  });
});
