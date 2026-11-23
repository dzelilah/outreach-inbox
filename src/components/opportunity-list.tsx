import Link from "next/link";
import { ContactedBadge, QualityIssueBadge, StatusBadge } from "@/components/badges";
import { Skeleton } from "@/components/ui/skeleton";
import type { Opportunity } from "@/generated/prisma/client";
import { inboxHref } from "@/lib/inbox-url";
import type { InboxFilters, QualityIssue } from "@/lib/quality";
import { cn } from "@/lib/utils";

export type OpportunityListItem = Opportunity & { issues: QualityIssue[] };

type OpportunityListProps = {
  items: OpportunityListItem[];
  /** Kept in the row links, so opening a row keeps the filters. */
  filters: InboxFilters;
  selectedId?: string;
};

// Same compact columns on every screen: checkbox, opportunity, score, status.
const COLUMNS = "grid grid-cols-[2.75rem_minmax(0,1fr)_3.5rem_6.5rem]";

/** Renders the opportunities in the order it receives them, as rounded rows. */
export function OpportunityList({ items, filters, selectedId }: OpportunityListProps) {
  return (
    <ul className="space-y-1 p-2">
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <li
            key={item.id}
            className={cn(
              COLUMNS,
              "rounded-xl px-1 hover:bg-muted/60",
              // The open row is a tinted, rounded tile with a thin orange frame.
              selected && "bg-accent ring-1 ring-orange-200 hover:bg-accent",
            )}
          >
            {/* Outside the link, so ticking the box does not open the row. Read by the bulk form. */}
            <label className="flex cursor-pointer items-start justify-center pt-4">
              <input
                type="checkbox"
                name="ids"
                value={item.id}
                aria-label={`Select ${item.domain}`}
                className="size-4 accent-orange-600"
              />
            </label>
            <OpportunityRow item={item} href={inboxHref(filters, item.id)} selected={selected} />
          </li>
        );
      })}
    </ul>
  );
}

function OpportunityRow(props: { item: OpportunityListItem; href: string; selected: boolean }) {
  const { item, href, selected } = props;

  return (
    // The link spans the remaining columns and reuses them through subgrid.
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      className="col-span-3 grid grid-cols-subgrid items-center py-3 pr-3"
    >
      <div className="min-w-0 space-y-0.5 pr-3">
        <p className="truncate font-semibold">{item.domain}</p>
        <p className="truncate text-sm text-muted-foreground">{item.linkingPageTitle}</p>
        <p className="truncate text-xs text-muted-foreground">
          DR {item.domainRating} · {item.topic.trim()}
        </p>
        {(item.issues.length > 0 || item.alreadyContacted) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.alreadyContacted && <ContactedBadge />}
            {item.issues.map((issue) => (
              <QualityIssueBadge key={issue} issue={issue} />
            ))}
          </div>
        )}
      </div>
      <span
        title="Relevance score"
        className="w-fit rounded-md bg-accent px-1.5 py-0.5 font-mono text-sm font-medium text-accent-foreground tabular-nums"
      >
        {item.relevanceScore}
      </span>
      <StatusBadge status={item.status} />
    </Link>
  );
}

/** Shown in place of the list when there is nothing to show. */
export function ListEmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-12 text-center md:px-6">
      <p className="font-medium">{title}</p>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function OpportunityListSkeleton() {
  const rows = ["a", "b", "c", "d", "e", "f"];
  return (
    <div className="divide-y" aria-busy="true" aria-label="Loading opportunities">
      {rows.map((key) => (
        <div key={key} className="space-y-2 px-4 py-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
