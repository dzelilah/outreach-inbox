import Link from "next/link";
import { inboxHref } from "@/lib/inbox-url";
import { QUALITY_VIEWS, type QualityView } from "@/lib/quality";
import { cn } from "@/lib/utils";

const QUALITY_VIEW_LABELS: Record<QualityView, string> = {
  relevant: "Relevant",
  all: "All",
  low: "Low-quality",
};

type InboxToolbarProps = {
  /** Rows still to review in the current view. */
  leftToReview: number;
  quality: QualityView;
  /** How many rows each view would show. */
  counts: Record<QualityView, number>;
  /** Kept in the links, so changing the view keeps the open opportunity. */
  selectedId?: string;
};

/** Each view is a plain link, so the choice lives in the URL. */
export function InboxToolbar({ leftToReview, quality, counts, selectedId }: InboxToolbarProps) {
  return (
    // On wide screens the counter and the views share one row; on narrow screens they stack.
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b bg-card px-4 py-2.5 md:px-6">
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
      <nav aria-label="Filter by quality" className="inline-flex rounded-lg border bg-card p-0.5">
        {QUALITY_VIEWS.map((view) => {
          const selected = view === quality;
          return (
            <Link
              key={view}
              href={inboxHref({ quality: view, id: selectedId })}
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
