import { describe, expect, it } from "vitest";
import { APP_LOCALES } from "@/constants/i18n";
import { ACCOUNT_COPY, isAccountErrorCode, type AccountErrorCode } from "@/lib/i18n/account-copy";

const ERROR_CODES: AccountErrorCode[] = ["login", "rate", "unavailable"];

describe("account copy", () => {
  it.each(APP_LOCALES)("has every visible string in %s", (locale) => {
    const copy = ACCOUNT_COPY[locale];
    for (const [key, value] of Object.entries(copy)) {
      if (typeof value === "string") expect(value, key).toBeTruthy();
    }
    expect(Object.keys(copy.financialStatus).length).toBeGreaterThan(0);
  });

  it.each(APP_LOCALES)("covers every error code in %s", (locale) => {
    for (const code of ERROR_CODES) {
      expect(ACCOUNT_COPY[locale].errors[code]).toBeTruthy();
    }
  });

  it.each(APP_LOCALES)("greets with and without a name in %s", (locale) => {
    const copy = ACCOUNT_COPY[locale];
    expect(copy.greeting(null)).toBeTruthy();
    expect(copy.greeting("Ana")).toContain("Ana");
    expect(copy.linkLabel(true)).not.toBe(copy.linkLabel(false));
  });

  it("is translated, not copied from English", () => {
    expect(ACCOUNT_COPY.pt.signOut).not.toBe(ACCOUNT_COPY.en.signOut);
    expect(ACCOUNT_COPY.es.signOut).not.toBe(ACCOUNT_COPY.en.signOut);
    expect(ACCOUNT_COPY.es.noOrders).not.toBe(ACCOUNT_COPY.pt.noOrders);
  });

  it("only accepts known error codes from the query string", () => {
    expect(isAccountErrorCode("rate")).toBe(true);
    expect(isAccountErrorCode("other")).toBe(false);
    expect(isAccountErrorCode(undefined)).toBe(false);
  });
});
