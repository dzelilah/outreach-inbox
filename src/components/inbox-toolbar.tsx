import Link from "next/link";
import { QUALITY_VIEWS, type QualityView } from "@/lib/quality";
import { cn } from "@/lib/utils";

const QUALITY_VIEW_LABELS: Record<QualityView, string> = {
  relevant: "Relevant",
  all: "All",
  low: "Low-quality",
};

type InboxToolbarProps = {
  quality: QualityView;
  /** How many rows each view would show. */
  counts: Record<QualityView, number>;
};

/** Each view is a plain link, so the choice lives in the URL. */
export function InboxToolbar({ quality, counts }: InboxToolbarProps) {
  return (
    <div className="sticky top-0 z-10 flex h-12 items-center border-b bg-background px-4 md:px-6">
      <nav aria-label="Filter by quality" className="inline-flex rounded-lg bg-muted p-0.5">
        {QUALITY_VIEWS.map((view) => {
          const selected = view === quality;
          return (
            <Link
              key={view}
              // The default view needs no URL param.
              href={view === "relevant" ? "/" : `/?quality=${view}`}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm",
                selected
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {QUALITY_VIEW_LABELS[view]}
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                {counts[view]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
