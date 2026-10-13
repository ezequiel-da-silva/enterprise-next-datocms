import { describe, expect, it } from "vitest";
import { isSpeedInsightsEnabled } from "@/lib/analytics/speed-insights-config";

describe("isSpeedInsightsEnabled", () => {
  it("is on only on Vercel by default", () => {
    expect(isSpeedInsightsEnabled({ VERCEL: "1" })).toBe(true);
    expect(isSpeedInsightsEnabled({})).toBe(false);
    expect(isSpeedInsightsEnabled({ VERCEL: "" })).toBe(false);
  });

  it("lets SPEED_INSIGHTS_ENABLED override either way", () => {
    expect(isSpeedInsightsEnabled({ SPEED_INSIGHTS_ENABLED: "true" })).toBe(true);
    expect(isSpeedInsightsEnabled({ SPEED_INSIGHTS_ENABLED: " 1 " })).toBe(true);
    expect(isSpeedInsightsEnabled({ VERCEL: "1", SPEED_INSIGHTS_ENABLED: "0" })).toBe(false);
    expect(isSpeedInsightsEnabled({ VERCEL: "1", SPEED_INSIGHTS_ENABLED: "false" })).toBe(false);
  });
});
