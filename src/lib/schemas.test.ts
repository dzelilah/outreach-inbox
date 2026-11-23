import { describe, expect, it } from "vitest";
import { qualityViewSchema, saveDraftSchema } from "./schemas";

describe("saveDraftSchema", () => {
  it("accepts a draft and keeps it exactly as typed", () => {
    const input = { id: "op_35", draft: "Hi Anna,\n\nShort note.\n" };
    expect(saveDraftSchema.parse(input)).toEqual(input);
  });

  it("rejects an empty or whitespace-only draft", () => {
    expect(saveDraftSchema.safeParse({ id: "op_35", draft: "" }).success).toBe(false);
    expect(saveDraftSchema.safeParse({ id: "op_35", draft: " \n " }).success).toBe(false);
  });

  it("rejects a draft over 5000 characters", () => {
    expect(saveDraftSchema.safeParse({ id: "op_35", draft: "a".repeat(5000) }).success).toBe(true);
    expect(saveDraftSchema.safeParse({ id: "op_35", draft: "a".repeat(5001) }).success).toBe(false);
  });
});

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
