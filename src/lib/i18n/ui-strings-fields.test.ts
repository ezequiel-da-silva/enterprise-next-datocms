import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACCOUNT_COPY } from "@/lib/i18n/account-copy";
import { CART_COPY } from "@/lib/i18n/cart-copy";
import { CONSENT_COPY } from "@/lib/i18n/consent-copy";
import { resolveAccountCopy, resolveCartCopy, resolveConsentCopy } from "@/lib/i18n/resolve-ui-copy";
import { UI_STRINGS_FIELD_NAMES } from "@/lib/i18n/ui-strings-fields";

function camelToSnake(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

describe("ui_string field map", () => {
  it("has unique field names", () => {
    expect(new Set(UI_STRINGS_FIELD_NAMES).size).toBe(UI_STRINGS_FIELD_NAMES.length);
  });

  it("matches the api keys created by the Dato migration", () => {
    const migration = readFileSync(
      join(process.cwd(), "migrations", "1790700000_uiStringsSingleton.ts"),
      "utf8",
    );
    const apiKeys = [...migration.matchAll(/key: "([a-z_]+)"/g)].map((match) => match[1]).sort();
    const expected = UI_STRINGS_FIELD_NAMES.map(camelToSnake).sort();
    expect(apiKeys).toEqual(expected);
  });
});

describe("resolveConsentCopy", () => {
  const base = CONSENT_COPY.pt;

  it("keeps the code copy without a record or with empty fields", () => {
    expect(resolveConsentCopy(base, null)).toEqual(base);
    expect(resolveConsentCopy(base, { cookiesTitle: "  ", cookiesDescription: null })).toEqual(base);
  });

  it("overrides only filled fields", () => {
    const copy = resolveConsentCopy(base, { cookiesTitle: "Cookies e privacidade" });
    expect(copy.title).toBe("Cookies e privacidade");
    expect(copy.description).toBe(base.description);
  });
});

describe("resolveCartCopy", () => {
  const base = CART_COPY.en;

  it("overrides plain strings", () => {
    expect(resolveCartCopy(base, { cartCheckout: "Pay now" }).checkout).toBe("Pay now");
  });

  it("uses the link templates only when singular and plural are both set", () => {
    const both = resolveCartCopy(base, {
      cartLinkLabelOne: "Bag: {count} piece",
      cartLinkLabelOther: "Bag: {count} pieces",
    });
    expect(both.linkLabel(1)).toBe("Bag: 1 piece");
    expect(both.linkLabel(3)).toBe("Bag: 3 pieces");

    const onlyOne = resolveCartCopy(base, { cartLinkLabelOne: "Bag: {count} piece" });
    expect(onlyOne.linkLabel(1)).toBe(base.linkLabel(1));
    expect(onlyOne.linkLabel(3)).toBe(base.linkLabel(3));
  });
});

describe("resolveAccountCopy", () => {
  const base = ACCOUNT_COPY.pt;

  it("falls back to the code copy when empty", () => {
    const copy = resolveAccountCopy(base, null);
    expect(copy.greeting("Ana")).toBe(base.greeting("Ana"));
    expect(copy.greeting(null)).toBe(base.greeting(null));
    expect(copy.linkLabel(true)).toBe(base.linkLabel(true));
    expect(copy.errors).toEqual(base.errors);
  });

  it("applies templates, nested errors and header labels", () => {
    const copy = resolveAccountCopy(base, {
      accountGreeting: "Bem-vinda, {name}!",
      accountGreetingAnonymous: "Bem-vinda!",
      accountErrorRate: "Calma.",
      accountLinkLabelSignedOut: "Acessar",
    });
    expect(copy.greeting("Ana")).toBe("Bem-vinda, Ana!");
    expect(copy.greeting(null)).toBe("Bem-vinda!");
    expect(copy.errors.rate).toBe("Calma.");
    expect(copy.errors.login).toBe(base.errors.login);
    expect(copy.linkLabel(false)).toBe("Acessar");
    expect(copy.linkLabel(true)).toBe(base.linkLabel(true));
  });
});
