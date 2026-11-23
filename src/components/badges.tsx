import { MailCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Status } from "@/generated/prisma/enums";
import { QUALITY_ISSUE_LABELS, type QualityIssue } from "@/lib/quality";

/** Every status has a text label, so the badge never relies on color alone. */
const STATUS_BADGES: Record<Status, { label: string; className: string }> = {
  TO_REVIEW: { label: "To review", className: "bg-card" },
  APPROVED: { label: "Approved", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  SKIPPED: { label: "Skipped", className: "bg-muted text-muted-foreground" },
  DONE: { label: "Done", className: "border-sky-200 bg-sky-50 text-sky-800" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_BADGES[status];
  return (
    <Badge variant="outline" className={`rounded-md ${className}`}>
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

/** The topic as an outlined chip, like the topic chips in the Moonrank app. */
export function TopicChip({ topic }: { topic: string }) {
  return (
    <Badge variant="outline" className="rounded-md border-indigo-200 bg-indigo-50/60 text-indigo-700">
      {topic.trim()}
    </Badge>
  );
}
