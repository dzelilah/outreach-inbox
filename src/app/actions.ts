"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { saveDraftSchema } from "@/lib/schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveDraft(input: { id: string; draft: string }): Promise<ActionResult> {
  // Anyone can POST to a Server Action, so the input is checked here, not only in the UI.
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { id, draft } = parsed.data;
  // updateMany returns a count instead of throwing when the id does not exist.
  const { count } = await prisma.opportunity.updateMany({ where: { id }, data: { draft } });
  if (count === 0) return { ok: false, error: "This opportunity no longer exists." };

  // Re-render the page so the list and the detail show the saved text.
  refresh();
  return { ok: true };
}
