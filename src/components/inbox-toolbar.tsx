import { Square, SquareCheck } from "lucide-react";
import Link from "next/link";
import { inboxHref } from "@/lib/inbox-url";
import { type InboxFilters, QUALITY_VIEWS, type QualityView } from "@/lib/quality";
import { cn } from "@/lib/utils";

const QUALITY_VIEW_LABELS: Record<QualityView, string> = {
  relevant: "Relevant",
  all: "All",
  low: "Low-quality",
};

type InboxToolbarProps = {
  filters: InboxFilters;
  /** Rows still to review in the current view. */
  leftToReview: number;
  /** How many rows each view would show. */
  counts: Record<QualityView, number>;
  /** Kept in the links, so changing a filter keeps the open opportunity. */
  selectedId?: string;
};

/** Every filter is a plain link, so the choice lives in the URL. */
export function InboxToolbar({ filters, leftToReview, counts, selectedId }: InboxToolbarProps) {
  const CheckIcon = filters.hideContacted ? SquareCheck : Square;

  return (
    <div className="sticky top-0 z-10 space-y-2 border-b bg-card px-4 py-2.5 md:px-6 xl:hidden">
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm">
          {leftToReview > 0 ? (
            <>
              <span className="font-mono font-medium text-accent-foreground tabular-nums">
                {leftToReview}
              </span>{" "}
              left to review
            </>
          ) : (
            <span className="font-medium">All caught up</span>
          )}
        </p>
        <Link
          href={inboxHref({ ...filters, hideContacted: !filters.hideContacted }, selectedId)}
          aria-current={filters.hideContacted ? "true" : undefined}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm",
            filters.hideContacted
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CheckIcon aria-hidden className="size-4" />
          Hide contacted
        </Link>
      </div>

      <nav aria-label="Filter by quality" className="inline-flex rounded-lg border bg-card p-0.5">
        {QUALITY_VIEWS.map((view) => {
          const selected = view === filters.quality;
          return (
            <Link
              key={view}
              href={inboxHref({ ...filters, quality: view }, selectedId)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm",
                selected
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {QUALITY_VIEW_LABELS[view]}
              <span className="ml-1.5 font-mono text-xs tabular-nums opacity-70">
                {counts[view]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
