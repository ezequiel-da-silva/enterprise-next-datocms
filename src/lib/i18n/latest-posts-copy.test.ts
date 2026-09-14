import { describe, expect, it } from "vitest";
import { APP_LOCALES } from "@/constants/i18n";
import { latestPostsCopy } from "@/lib/i18n/latest-posts-copy";

describe("latest posts copy", () => {
  it.each(APP_LOCALES)("has carousel role descriptions in %s", (locale) => {
    const copy = latestPostsCopy(locale);
    expect(copy.carousel).toBeTruthy();
    expect(copy.roleDescription).toBeTruthy();
    expect(copy.slideRoleDescription).toBeTruthy();
  });
});
