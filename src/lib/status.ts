import type { Status } from "@/generated/prisma/enums";

/**
 * An approval is for one exact text. Saving a different text on an approved
 * row sends it back to review; any other status stays as it is.
 */
export function statusAfterDraftEdit(status: Status, savedDraft: string, newDraft: string): Status {
  return status === "APPROVED" && newDraft !== savedDraft ? "TO_REVIEW" : status;
}
