import { describe, expect, it } from "vitest";
import { qualityViewSchema } from "./schemas";

describe("qualityViewSchema", () => {
  it("accepts the known views", () => {
    expect(qualityViewSchema.parse("all")).toBe("all");
    expect(qualityViewSchema.parse("low")).toBe("low");
  });

  it("falls back to the relevant view for a missing, unknown or repeated param", () => {
    expect(qualityViewSchema.parse(undefined)).toBe("relevant");
    expect(qualityViewSchema.parse("everything")).toBe("relevant");
    expect(qualityViewSchema.parse(["low", "all"])).toBe("relevant");
  });
});
