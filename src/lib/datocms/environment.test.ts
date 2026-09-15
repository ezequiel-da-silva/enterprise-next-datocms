import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_DATOCMS_ENVIRONMENT, readDatoCmsEnvironment } from "@/lib/datocms/environment";

describe("readDatoCmsEnvironment", () => {
  const previous = process.env.DATOCMS_ENVIRONMENT;

  afterEach(() => {
    if (previous === undefined) delete process.env.DATOCMS_ENVIRONMENT;
    else process.env.DATOCMS_ENVIRONMENT = previous;
  });

  it("defaults to main when unset or blank", () => {
    delete process.env.DATOCMS_ENVIRONMENT;
    expect(readDatoCmsEnvironment()).toBe(DEFAULT_DATOCMS_ENVIRONMENT);
    process.env.DATOCMS_ENVIRONMENT = "  ";
    expect(readDatoCmsEnvironment()).toBe("main");
  });

  it("uses develop when set", () => {
    process.env.DATOCMS_ENVIRONMENT = " develop ";
    expect(readDatoCmsEnvironment()).toBe("develop");
  });
});
