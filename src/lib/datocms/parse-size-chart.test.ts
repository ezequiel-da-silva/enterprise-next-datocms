import { describe, expect, it } from "vitest";
import { parseSizeChart } from "@/lib/datocms/parse-size-chart";

describe("parseSizeChart", () => {
  it("reads a biometric matrix", () => {
    expect(
      parseSizeChart([
        { length: 152, riderWeightKg: "55-70", waistWidthMm: 248 },
        { length: 156, riderWeightKg: "65-80", waistWidthMm: 252 },
      ]),
    ).toEqual([
      { length: 152, riderWeightKg: "55-70", waistWidthMm: 248 },
      { length: 156, riderWeightKg: "65-80", waistWidthMm: 252 },
    ]);
  });

  it("accepts the JSON string stored by the CMA seed", () => {
    expect(parseSizeChart('[{"length":148,"riderWeightKg":"50-65","waistWidthMm":246}]')).toEqual([
      { length: 148, riderWeightKg: "50-65", waistWidthMm: 246 },
    ]);
  });

  it("drops incomplete rows and rejects anything that is not a list", () => {
    expect(parseSizeChart([{ length: 152 }, { length: 0, riderWeightKg: "55-70", waistWidthMm: 248 }])).toEqual([]);
    expect(parseSizeChart({ length: 152 })).toEqual([]);
    expect(parseSizeChart("not-json")).toEqual([]);
    expect(parseSizeChart(null)).toEqual([]);
  });
});
