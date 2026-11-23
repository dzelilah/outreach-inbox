import type { Status } from "@/generated/prisma/enums";

/**
 * An approval is for one exact text. Saving a different text on an approved
 * row sends it back to review; any other status stays as it is.
 */
export function statusAfterDraftEdit(status: Status, savedDraft: string, newDraft: string): Status {
  return status === "APPROVED" && newDraft !== savedDraft ? "TO_REVIEW" : status;
}

/**
 * Rows still waiting for a decision. Pass the rows of the current view, so
 * rows the user chose to hide do not count as work left.
 */
export function countLeftToReview(items: { status: Status }[]) {
  return items.filter((item) => item.status === "TO_REVIEW").length;
}
