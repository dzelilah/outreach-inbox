import { describe, expect, it } from "vitest";
import { draftInputSchema, qualityViewSchema, setStatusSchema } from "./schemas";

describe("setStatusSchema", () => {
  it("rejects APPROVED, which must go through approveDraft", () => {
    expect(setStatusSchema.safeParse({ id: "op_35", status: "SKIPPED" }).success).toBe(true);
    expect(setStatusSchema.safeParse({ id: "op_35", status: "APPROVED" }).success).toBe(false);
  });
});

describe("draftInputSchema", () => {
  it("accepts a draft and keeps it exactly as typed", () => {
    const input = { id: "op_35", draft: "Hi Anna,\n\nShort note.\n" };
    expect(draftInputSchema.parse(input)).toEqual(input);
  });

  it("rejects an empty or whitespace-only draft", () => {
    expect(draftInputSchema.safeParse({ id: "op_35", draft: "" }).success).toBe(false);
    expect(draftInputSchema.safeParse({ id: "op_35", draft: " \n " }).success).toBe(false);
  });

  it("rejects a draft over 5000 characters", () => {
    expect(draftInputSchema.safeParse({ id: "op_35", draft: "a".repeat(5000) }).success).toBe(true);
    expect(draftInputSchema.safeParse({ id: "op_35", draft: "a".repeat(5001) }).success).toBe(false);
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
