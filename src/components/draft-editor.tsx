"use client";

import { Check, ChevronDown, CircleCheck, Mail, Sparkles } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { type ReactNode, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { type ActionResult, approveDraft, rewriteDraft, saveDraft, setStatus } from "@/app/actions";
import { STATUS_BADGES } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Status } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { status: Status; label: string; dot: string }[] = [
  { status: "TO_REVIEW", label: "To review", dot: "bg-orange-500" },
  { status: "APPROVED", label: "Approved", dot: "bg-emerald-500" },
  { status: "SKIPPED", label: "Skipped", dot: "bg-stone-400" },
  { status: "DONE", label: "Done", dot: "bg-sky-500" },
];

type DraftEditorProps = {
  id: string;
  status: Status;
  contactName: string | null;
  savedDraft: string;
  originalDraft: string;
  canApprove: boolean;
  /** Which rewriter the button uses, e.g. "mock". */
  rewriterName: string;
  /** The domain heading; the status dropdown sits next to it. */
  header: ReactNode;
  /** Facts shown between the heading and the draft. */
  children: ReactNode;
};

/**
 * Edits the draft and sets the status. The status dropdown lives here because
 * approving sends the text that is in the editor right now. Nothing is saved automatically.
 */
export function DraftEditor(props: DraftEditorProps) {
  const { id, status, contactName, savedDraft, originalDraft, canApprove, rewriterName, header, children } =
    props;
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

  // Approve saves the text in the editor together with the status; the others only change the status.
  function changeStatus(target: Status) {
    run(() =>
      target === "APPROVED" ? approveDraft({ id, draft: text }) : setStatus({ id, status: target }),
    );
  }

  // The rewrite only replaces the text in the editor as an unsaved change;
  // the user reviews it and then saves, approves or discards it.
  function rewrite() {
    startAction(async () => {
      const result = await rewriteDraft({ id, draft: text });
      if (result.ok) {
        setText(result.text);
        toast.success("Draft rewritten. Review it, then save or approve it.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <article className="@container space-y-4">
      {/* No wrapping: the status stays in the top right corner and a long title wraps instead. */}
      <div className="flex items-start justify-between gap-3">
        {header}
        <div className="max-w-32 shrink-0 space-y-1 text-right @md:max-w-none">
          <StatusMenu
            status={status}
            disabled={isPending}
            approveBlockedBy={!canApprove ? "needs a contact" : isEmpty ? "draft is empty" : null}
            onChange={changeStatus}
          />
          <p className="text-xs text-muted-foreground">
            {canApprove ? "Approving saves the draft below." : "No contact, so it cannot be approved."}
          </p>
        </div>
      </div>

      {children}

      <section className="space-y-3 rounded-xl border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="draft" className="flex items-center gap-2 font-medium">
            <Mail aria-hidden className="size-4 text-orange-500" />
            Email draft
          </label>
          <Button
            variant="outline"
            size="sm"
            className="border-orange-200 bg-accent text-accent-foreground hover:bg-orange-100"
            onClick={rewrite}
            disabled={isEmpty || isPending}
          >
            <Sparkles aria-hidden />
            Rewrite with AI ({rewriterName})
          </Button>
        </div>

        <p className="text-sm">
          <span className="text-muted-foreground">To: </span>
          {contactName ?? <span className="text-muted-foreground">no contact</span>}
        </p>

        <Textarea
          id="draft"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-48 leading-relaxed"
        />

        <div className="flex flex-wrap items-center gap-2">
          <p aria-live="polite" className="mr-auto text-xs">
            {isPending ? (
              <span className="text-muted-foreground">Working…</span>
            ) : isDirty ? (
              <span className="font-medium text-amber-700">Unsaved changes</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CircleCheck aria-hidden className="size-3.5" />
                Draft saved
              </span>
            )}
          </p>
          <Button variant="ghost" onClick={() => setText(savedDraft)} disabled={!isDirty || isPending}>
            Discard
          </Button>
          {/* Puts the seed text back into the editor; the user still has to save it. */}
          {text !== originalDraft && (
            <Button variant="outline" onClick={() => setText(originalDraft)} disabled={isPending}>
              Reset to original
            </Button>
          )}
          <Button
            onClick={() => run(() => saveDraft({ id, draft: text }))}
            disabled={!isDirty || isEmpty || isPending}
          >
            Save
          </Button>
        </div>
      </section>

    </article>
  );
}

type StatusMenuProps = {
  status: Status;
  disabled: boolean;
  /** Why Approved cannot be picked right now, or null when it can. */
  approveBlockedBy: string | null;
  onChange: (status: Status) => void;
};

/** One status at a time, so a dropdown. Built on Radix, which handles keyboard and focus. */
function StatusMenu({ status, disabled, approveBlockedBy, onChange }: StatusMenuProps) {
  const current = STATUS_OPTIONS.find((option) => option.status === status);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        disabled={disabled}
        aria-label="Change status"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60",
          STATUS_BADGES[status].className,
        )}
      >
        {current?.label}
        <ChevronDown aria-hidden className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-52 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {/* The value comes back as a string, so it is matched against the known options. */}
          <DropdownMenu.RadioGroup
            value={status}
            onValueChange={(value) => {
              const picked = STATUS_OPTIONS.find((option) => option.status === value);
              if (picked && picked.status !== status) onChange(picked.status);
            }}
          >
            {STATUS_OPTIONS.map((option) => {
              const blockedBy = option.status === "APPROVED" ? approveBlockedBy : null;
              return (
                <DropdownMenu.RadioItem
                  key={option.status}
                  value={option.status}
                  disabled={blockedBy !== null}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-muted"
                >
                  <span aria-hidden className={cn("size-2 rounded-full", option.dot)} />
                  {option.label}
                  {blockedBy && <span className="text-xs text-muted-foreground">{blockedBy}</span>}
                  <DropdownMenu.ItemIndicator className="ml-auto">
                    <Check aria-hidden className="size-4" />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
