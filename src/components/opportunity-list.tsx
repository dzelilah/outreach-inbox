import Link from "next/link";
import { QualityIssueBadge, StatusBadge, TopicChip } from "@/components/badges";
import { Skeleton } from "@/components/ui/skeleton";
import type { Opportunity } from "@/generated/prisma/client";
import { inboxHref } from "@/lib/inbox-url";
import type { QualityIssue, QualityView } from "@/lib/quality";
import { cn } from "@/lib/utils";

export type OpportunityListItem = Opportunity & { issues: QualityIssue[] };

type OpportunityListProps = {
  items: OpportunityListItem[];
  quality: QualityView;
  selectedId?: string;
};

/** Renders the opportunities in the order it receives them. Each row links to its detail. */
export function OpportunityList({ items, quality, selectedId }: OpportunityListProps) {
  return (
    <ul className="space-y-1 p-2">
      {items.map((item) => (
        <li key={item.id}>
          <OpportunityRow
            item={item}
            href={inboxHref({ quality, id: item.id })}
            selected={item.id === selectedId}
          />
        </li>
      ))}
    </ul>
  );
}

function OpportunityRow(props: { item: OpportunityListItem; href: string; selected: boolean }) {
  const { item, href, selected } = props;
  // Low-quality rows stay in the list but are dimmed; the badges say why.
  const muted = item.issues.length > 0 && "text-muted-foreground";

  return (
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex gap-3 rounded-lg px-3 py-3 hover:bg-muted/60 md:px-4",
        // The open row is a tinted tile, like the active item in the Moonrank sidebar.
        selected && "bg-accent hover:bg-accent",
      )}
    >
      <div className="flex w-11 shrink-0 flex-col items-center gap-1">
        <span
          className={cn(
            "w-full rounded-md border bg-card py-0.5 text-center font-mono text-sm font-medium tabular-nums",
            muted,
          )}
        >
          {item.relevanceScore}
        </span>
        <span className="eyebrow">Score</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("truncate font-medium", muted)}>{item.domain}</p>
          <StatusBadge status={item.status} />
        </div>
        <p className="truncate text-sm text-muted-foreground">{item.linkingPageTitle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <TopicChip topic={item.topic} />
          <span>DR {item.domainRating}</span>
          <span>· links to {item.competitorLinked}</span>
        </div>
        {item.issues.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.issues.map((issue) => (
              <QualityIssueBadge key={issue} issue={issue} />
            ))}
          </div>
        )}
      </div>
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
    <div className="space-y-1 p-2" aria-busy="true" aria-label="Loading opportunities">
      {rows.map((key) => (
        <div key={key} className="flex gap-3 px-3 py-3 md:px-4">
          <Skeleton className="h-6 w-11 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
