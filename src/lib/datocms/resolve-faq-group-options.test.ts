import { describe, expect, it } from "vitest";
import {
  FAQ_GROUP_DEFAULTS,
  resolveFaqGroupOptions,
} from "@/lib/datocms/resolve-faq-group-options";

describe("resolveFaqGroupOptions", () => {
  it("returns defaults when faq_configuration is off or absent", () => {
    expect(resolveFaqGroupOptions({})).toEqual(FAQ_GROUP_DEFAULTS);
    expect(resolveFaqGroupOptions({ faqConfiguration: false })).toEqual(FAQ_GROUP_DEFAULTS);
    expect(
      resolveFaqGroupOptions({
        faqConfiguration: false,
        accordionMode: "multiple",
        openFirstItem: true,
      }),
    ).toEqual(FAQ_GROUP_DEFAULTS);
  });

  it("uses defaults baseline values", () => {
    expect(FAQ_GROUP_DEFAULTS).toEqual({
      accordionMode: "single",
      openFirstItem: false,
      enableFaqSchema: true,
      headerAlignment: "left",
    });
  });

  it("reads custom fields when faq_configuration is true", () => {
    expect(
      resolveFaqGroupOptions({
        faqConfiguration: true,
        accordionMode: "multiple",
        openFirstItem: true,
        enableFaqSchema: false,
        headerAlignment: "center",
      }),
    ).toEqual({
      accordionMode: "multiple",
      openFirstItem: true,
      enableFaqSchema: false,
      headerAlignment: "center",
    });
  });

  it("supports advanced_options legacy alias", () => {
    expect(
      resolveFaqGroupOptions({
        advanced_options: true,
        accordion_mode: "multiple",
      }).accordionMode,
    ).toBe("multiple");
  });

  it("parses Portuguese alignment labels from CMS", () => {
    expect(
      resolveFaqGroupOptions({
        faqConfiguration: true,
        headerAlignment: "Centralizado",
      }).headerAlignment,
    ).toBe("center");
    expect(
      resolveFaqGroupOptions({
        faqConfiguration: true,
        header_alignment: "Direita",
      }).headerAlignment,
    ).toBe("right");
  });

  it("falls back to single for unknown accordion mode", () => {
    expect(
      resolveFaqGroupOptions({
        faqConfiguration: true,
        accordionMode: "invalid",
      }).accordionMode,
    ).toBe("single");
  });
});
