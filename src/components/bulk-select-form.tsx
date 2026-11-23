"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { bulkUpdateStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";

/**
 * Wraps the list in a plain form. Each row has an "ids" checkbox, and the bar
 * submits the checked ids with the status of the button that was clicked.
 */
export function BulkSelectForm({ children }: { children: React.ReactNode }) {
  const [selectedCount, setSelectedCount] = useState(0);

  async function submit(formData: FormData) {
    const result = await bulkUpdateStatus(formData);
    if (result.ok) toast.success(result.message);
    else toast.error(result.error);
    // React clears the checkboxes after the action, so the count starts over too.
    setSelectedCount(0);
  }

  return (
    <form
      action={submit}
      // onInput, not onChange: after a form reset React's onChange skips the next tick of
      // the same checkbox, because it did not see the reset. The native input event always fires.
      onInput={(event) => setSelectedCount(new FormData(event.currentTarget).getAll("ids").length)}
      onReset={() => setSelectedCount(0)}
    >
      {children}
      {selectedCount > 0 && <BulkBar count={selectedCount} />}
    </form>
  );
}

function BulkBar({ count }: { count: number }) {
  // Pending while the form's action runs; useFormStatus only works inside the form.
  const { pending } = useFormStatus();

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t bg-card px-4 py-2.5 md:px-6">
      <p className="mr-auto text-sm">
        <span className="font-mono font-medium tabular-nums">{count}</span> selected
      </p>
      <Button type="submit" name="status" value="SKIPPED" size="sm" disabled={pending}>
        Skip
      </Button>
      <Button type="submit" name="status" value="TO_REVIEW" variant="outline" size="sm" disabled={pending}>
        Move to review
      </Button>
      <Button type="reset" variant="ghost" size="sm" disabled={pending}>
        Clear
      </Button>
    </div>
  );
}
