import { QualityIssueBadge, StatusBadge } from "@/components/badges";
import { Skeleton } from "@/components/ui/skeleton";
import type { Opportunity } from "@/generated/prisma/client";
import type { QualityIssue } from "@/lib/quality";
import { cn } from "@/lib/utils";

export type OpportunityListItem = Opportunity & { issues: QualityIssue[] };

/** Renders the opportunities in the order it receives them. */
export function OpportunityList({ items }: { items: OpportunityListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-12 text-center md:px-6">
        <p className="font-medium">No opportunities yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Run <code className="font-mono">npm run setup</code> to import the seed data.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.id}>
          <OpportunityRow item={item} />
        </li>
      ))}
    </ul>
  );
}

function OpportunityRow({ item }: { item: OpportunityListItem }) {
  // Low-quality rows stay in the list but are dimmed; the badges say why.
  const muted = item.issues.length > 0 && "text-muted-foreground";

  return (
    <div className="flex gap-3 px-4 py-3 md:px-6">
      <div className="w-10 shrink-0 text-center">
        <p className={cn("text-lg leading-6 font-semibold tabular-nums", muted)}>
          {item.relevanceScore}
        </p>
        <p className="text-[10px] tracking-wide text-muted-foreground uppercase">Score</p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("truncate font-medium", muted)}>{item.domain}</p>
          <StatusBadge status={item.status} />
        </div>
        <p className="truncate text-sm text-muted-foreground">{item.linkingPageTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          DR {item.domainRating} · {item.topic.trim()} · links to {item.competitorLinked}
        </p>
        {item.issues.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.issues.map((issue) => (
              <QualityIssueBadge key={issue} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OpportunityListSkeleton() {
  const rows = ["a", "b", "c", "d", "e", "f"];
  return (
    <div className="divide-y" aria-busy="true" aria-label="Loading opportunities">
      {rows.map((key) => (
        <div key={key} className="flex gap-3 px-4 py-3 md:px-6">
          <Skeleton className="size-10 shrink-0" />
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
