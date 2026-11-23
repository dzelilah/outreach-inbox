"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { type ActionResult, approveDraft, saveDraft, setStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Status } from "@/generated/prisma/enums";

type DraftEditorProps = {
  id: string;
  status: Status;
  savedDraft: string;
  originalDraft: string;
  canApprove: boolean;
};

/**
 * Edits the draft and sets the status. Approve lives here because it sends the
 * text that is in the editor right now. Nothing is saved automatically.
 */
export function DraftEditor({ id, status, savedDraft, originalDraft, canApprove }: DraftEditorProps) {
  const [text, setText] = useState(savedDraft);
  const [isPending, startAction] = useTransition();
  const isDirty = text !== savedDraft;
  const isEmpty = text.trim() === "";

  // Ask before a reload or closing the tab throws away unsaved text.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // Runs one Server Action and shows its result as a toast.
  function run(action: () => Promise<ActionResult>) {
    startAction(async () => {
      const result = await action();
      if (result.ok) toast.success(result.message);
      else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="draft" className="text-sm font-medium">
            Outreach draft
          </label>
          {isPending ? (
            <span className="text-xs text-muted-foreground">Saving…</span>
          ) : (
            isDirty && <span className="text-xs font-medium text-amber-700">Unsaved changes</span>
          )}
        </div>

        <Textarea
          id="draft"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-48 leading-relaxed"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => run(() => saveDraft({ id, draft: text }))}
            disabled={!isDirty || isEmpty || isPending}
          >
            Save draft
          </Button>
          <Button variant="ghost" onClick={() => setText(savedDraft)} disabled={!isDirty || isPending}>
            Discard changes
          </Button>
          {/* Puts the seed text back into the editor; the user still has to save it. */}
          {text !== originalDraft && (
            <Button variant="ghost" onClick={() => setText(originalDraft)} disabled={isPending}>
              Reset to original
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-2 border-t pt-4">
        <h3 className="text-sm font-medium">Decision</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => run(() => approveDraft({ id, draft: text }))}
            disabled={!canApprove || isEmpty || isPending || (status === "APPROVED" && !isDirty)}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => run(() => setStatus({ id, status: "SKIPPED" }))}
            disabled={isPending || status === "SKIPPED"}
          >
            Skip
          </Button>
          <Button
            variant="outline"
            onClick={() => run(() => setStatus({ id, status: "DONE" }))}
            disabled={isPending || status === "DONE"}
          >
            Mark done
          </Button>
          {status !== "TO_REVIEW" && (
            <Button
              variant="ghost"
              onClick={() => run(() => setStatus({ id, status: "TO_REVIEW" }))}
              disabled={isPending}
            >
              Back to review
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {canApprove
            ? "Approve saves the text above as the message to send. Nothing is sent from this app."
            : "This opportunity has no contact, so it cannot be approved: there is nobody to send it to."}
        </p>
      </section>
    </div>
  );
}
