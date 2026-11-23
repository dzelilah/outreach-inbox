import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Status } from "@/generated/prisma/enums";
import { QUALITY_ISSUE_LABELS, type QualityIssue } from "@/lib/quality";

/** Every status has a text label, so the badge never relies on color alone. */
const STATUS_BADGES: Record<Status, { label: string; className: string }> = {
  TO_REVIEW: { label: "To review", className: "" },
  APPROVED: { label: "Approved", className: "border-transparent bg-emerald-50 text-emerald-700" },
  SKIPPED: { label: "Skipped", className: "border-transparent bg-muted text-muted-foreground" },
  DONE: { label: "Done", className: "border-transparent bg-sky-50 text-sky-700" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_BADGES[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function QualityIssueBadge({ issue }: { issue: QualityIssue }) {
  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
      <TriangleAlert aria-hidden />
      {QUALITY_ISSUE_LABELS[issue]}
    </Badge>
  );
}
