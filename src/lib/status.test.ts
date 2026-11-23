import { describe, expect, it } from "vitest";
import { countLeftToReview, statusAfterDraftEdit } from "./status";

describe("statusAfterDraftEdit", () => {
  it("sends an approved row back to review when its text changes", () => {
    expect(statusAfterDraftEdit("APPROVED", "old", "new")).toBe("TO_REVIEW");
  });

  it("keeps the approval when the text is the same", () => {
    expect(statusAfterDraftEdit("APPROVED", "same", "same")).toBe("APPROVED");
  });

  it("keeps any other status", () => {
    expect(statusAfterDraftEdit("SKIPPED", "old", "new")).toBe("SKIPPED");
    expect(statusAfterDraftEdit("TO_REVIEW", "old", "new")).toBe("TO_REVIEW");
  });
});

describe("countLeftToReview", () => {
  it("counts only rows that are still to review", () => {
    const items = [
      { status: "TO_REVIEW" as const },
      { status: "APPROVED" as const },
      { status: "TO_REVIEW" as const },
      { status: "SKIPPED" as const },
      { status: "DONE" as const },
    ];
    expect(countLeftToReview(items)).toBe(2);
    expect(countLeftToReview([])).toBe(0);
  });
});
