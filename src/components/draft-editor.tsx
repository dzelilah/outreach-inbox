"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { saveDraft } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type DraftEditorProps = {
  id: string;
  savedDraft: string;
  originalDraft: string;
};

/** Edits a draft locally until the user clicks Save. Nothing is saved automatically. */
export function DraftEditor({ id, savedDraft, originalDraft }: DraftEditorProps) {
  const [text, setText] = useState(savedDraft);
  const [isSaving, startSaving] = useTransition();
  const isDirty = text !== savedDraft;

  // Ask before a reload or closing the tab throws away unsaved text.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function save() {
    startSaving(async () => {
      const result = await saveDraft({ id, draft: text });
      if (result.ok) toast.success("Draft saved");
      else toast.error(result.error);
    });
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="draft" className="text-sm font-medium">
          Outreach draft
        </label>
        {isDirty && <span className="text-xs font-medium text-amber-700">Unsaved changes</span>}
      </div>

      <Textarea
        id="draft"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="min-h-48 leading-relaxed"
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={!isDirty || text.trim() === "" || isSaving}>
          {isSaving ? "Saving…" : "Save draft"}
        </Button>
        <Button variant="outline" onClick={() => setText(savedDraft)} disabled={!isDirty || isSaving}>
          Discard changes
        </Button>
        {/* Puts the seed text back into the editor; the user still has to save it. */}
        {text !== originalDraft && (
          <Button variant="ghost" onClick={() => setText(originalDraft)} disabled={isSaving}>
            Reset to original
          </Button>
        )}
      </div>
    </section>
  );
}
