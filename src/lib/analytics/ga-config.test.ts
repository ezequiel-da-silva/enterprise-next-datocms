import { describe, expect, it } from "vitest";
import { readGaMeasurementId } from "@/lib/analytics/ga-config";

describe("readGaMeasurementId", () => {
  it("accepts GA4 IDs", () => {
    expect(readGaMeasurementId({ GA_MEASUREMENT_ID: " g-abc123 " })).toBe("G-ABC123");
  });

  it("rejects missing or malformed IDs", () => {
    expect(readGaMeasurementId({})).toBeNull();
    expect(readGaMeasurementId({ GA_MEASUREMENT_ID: "UA-123-1" })).toBeNull();
    expect(readGaMeasurementId({ GA_MEASUREMENT_ID: "G-<script>" })).toBeNull();
  });
});
