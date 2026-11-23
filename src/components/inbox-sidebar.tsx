import { Inbox, Layers, type LucideIcon, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { inboxHref } from "@/lib/inbox-url";
import type { InboxFilters, QualityView } from "@/lib/quality";
import { cn } from "@/lib/utils";

/** The app name with its icon, used in the sidebar and in the mobile header. */
export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-orange-600">
        <Inbox aria-hidden className="size-5" />
      </span>
      <div>
        <p className="leading-tight font-semibold tracking-tight">Outreach Inbox</p>
        <p className="text-xs text-muted-foreground">Link-building review</p>
      </div>
    </div>
  );
}

const VIEWS: { view: QualityView; label: string; Icon: LucideIcon }[] = [
  { view: "relevant", label: "Relevant", Icon: Inbox },
  { view: "all", label: "All", Icon: Layers },
  { view: "low", label: "Low-quality", Icon: TriangleAlert },
];

type InboxSidebarProps = {
  filters: InboxFilters;
  /** How many rows each view would show. */
  counts: Record<QualityView, number>;
  /** Rows in the current view, and how many of them still need a decision. */
  shown: number;
  leftToReview: number;
  selectedId?: string;
};

/** Wide screens only. Every item is a real filter link; there are no placeholder pages. */
export function InboxSidebar({ filters, counts, shown, leftToReview, selectedId }: InboxSidebarProps) {
  const reviewed = shown - leftToReview;

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-card p-4 xl:flex">
      <Brand />

      <nav aria-label="Views" className="space-y-1">
        <p className="eyebrow px-2 pb-1">Views</p>
        {VIEWS.map(({ view, label, Icon }) => {
          const selected = view === filters.quality;
          return (
            <Link
              key={view}
              href={inboxHref({ ...filters, quality: view }, selectedId)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm",
                selected
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
              <span
                className={cn(
                  "ml-auto rounded-md px-1.5 font-mono text-xs tabular-nums",
                  selected ? "bg-card" : "bg-muted",
                )}
              >
                {counts[view]}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1">
        <p className="eyebrow px-2 pb-1">Filters</p>
        <Link
          href={inboxHref({ ...filters, hideContacted: !filters.hideContacted }, selectedId)}
          aria-current={filters.hideContacted ? "true" : undefined}
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Hide contacted
          {/* Looks like a switch; it is a link that adds or removes ?hideContacted=1. */}
          <span
            aria-hidden
            className={cn(
              "ml-auto flex h-5 w-9 items-center rounded-full p-0.5",
              filters.hideContacted ? "justify-end bg-orange-500" : "justify-start bg-input",
            )}
          >
            <span className="size-4 rounded-full bg-white shadow-sm" />
          </span>
        </Link>
      </div>

      <div className="mt-auto space-y-2 rounded-xl border bg-background p-3">
        <p aria-live="polite" className="text-sm">
          {leftToReview > 0 ? (
            <>
              <span className="font-mono font-medium text-accent-foreground">{leftToReview}</span> left
              to review
            </>
          ) : (
            <span className="font-medium">All caught up</span>
          )}
        </p>
        {/* Share of the current view that already has a decision. */}
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-orange-500"
            style={{ width: `${shown > 0 ? (reviewed / shown) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {reviewed} of {shown} decided in this view
        </p>
      </div>
    </aside>
  );
}
