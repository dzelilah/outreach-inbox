"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { hasContact } from "@/lib/quality";
import { draftInputSchema, setStatusSchema } from "@/lib/schemas";
import { statusAfterDraftEdit } from "@/lib/status";

/** Every action returns a message for the toast, or an error to show instead. */
export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

const NOT_FOUND: ActionResult = { ok: false, error: "This opportunity no longer exists." };

// Anyone can POST to a Server Action, so each one checks its input here, not only in the UI.

export async function saveDraft(input: { id: string; draft: string }): Promise<ActionResult> {
  const parsed = draftInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { id, draft } = parsed.data;

  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) return NOT_FOUND;

  const status = statusAfterDraftEdit(current.status, current.draft, draft);
  await prisma.opportunity.update({ where: { id }, data: { draft, status } });
  // Re-render the page so the list and the detail show the saved data.
  refresh();

  return status !== current.status
    ? { ok: true, message: "Draft saved and moved back to review, because the approved text changed." }
    : { ok: true, message: "Draft saved" };
}

/** Approves the exact text in the editor: the text and the status are saved in one update. */
export async function approveDraft(input: { id: string; draft: string }): Promise<ActionResult> {
  const parsed = draftInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { id, draft } = parsed.data;

  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) return NOT_FOUND;
  if (!hasContact(current)) {
    return { ok: false, error: "This opportunity has no contact, so there is nobody to send it to." };
  }

  await prisma.opportunity.update({ where: { id }, data: { draft, status: "APPROVED" } });
  refresh();
  return { ok: true, message: "Approved" };
}

const STATUS_MESSAGES = {
  TO_REVIEW: "Moved back to review",
  SKIPPED: "Skipped",
  DONE: "Marked as done",
} as const;

/** Skip, Mark done and Back to review. Each one can be undone with another status change. */
export async function setStatus(input: {
  id: string;
  status: keyof typeof STATUS_MESSAGES;
}): Promise<ActionResult> {
  const parsed = setStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Unknown status." };
  const { id, status } = parsed.data;

  const { count } = await prisma.opportunity.updateMany({ where: { id }, data: { status } });
  if (count === 0) return NOT_FOUND;

  refresh();
  return { ok: true, message: STATUS_MESSAGES[status] };
}
