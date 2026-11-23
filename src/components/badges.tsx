import { MailCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Status } from "@/generated/prisma/enums";
import { QUALITY_ISSUE_LABELS, type QualityIssue } from "@/lib/quality";

/** Every status has a text label, so the badge never relies on color alone. */
export const STATUS_BADGES: Record<Status, { label: string; className: string }> = {
  TO_REVIEW: { label: "To review", className: "bg-accent text-accent-foreground" },
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700" },
  SKIPPED: { label: "Skipped", className: "bg-muted text-muted-foreground" },
  DONE: { label: "Done", className: "bg-sky-50 text-sky-700" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_BADGES[status];
  return (
    <Badge className={`shrink-0 px-2.5 ${className}`}>
      {label}
    </Badge>
  );
}

export function QualityIssueBadge({ issue }: { issue: QualityIssue }) {
  return (
    <Badge variant="outline" className="rounded-md border-amber-200 bg-amber-50 text-amber-800">
      <TriangleAlert aria-hidden />
      {QUALITY_ISSUE_LABELS[issue]}
    </Badge>
  );
}

/** Marks a row whose contact already got a message. */
export function ContactedBadge() {
  return (
    <Badge variant="outline" className="rounded-md border-violet-200 bg-violet-50 text-violet-700">
      <MailCheck aria-hidden />
      Contacted
    </Badge>
  );
}

