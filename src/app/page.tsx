import { ArrowLeft, Inbox as InboxIcon } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { InboxToolbar } from "@/components/inbox-toolbar";
import { OpportunityDetail } from "@/components/opportunity-detail";
import {
  ListEmptyState,
  OpportunityList,
  OpportunityListSkeleton,
} from "@/components/opportunity-list";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { inboxHref } from "@/lib/inbox-url";
import {
  applyFilters,
  compareByRelevance,
  findSameDomainIds,
  getQualityIssues,
  type InboxFilters,
  type QualityView,
} from "@/lib/quality";
import { qualityViewSchema } from "@/lib/schemas";
import { countLeftToReview } from "@/lib/status";
import { cn } from "@/lib/utils";

const LIST_WIDTH = "md:w-[26rem] md:shrink-0 lg:w-[32rem]";

export default function InboxPage({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col md:h-dvh">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:px-6">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <InboxIcon aria-hidden className="size-5" />
        </span>
        <div>
          <h1 className="text-lg leading-tight font-semibold tracking-tight">
            Outreach Inbox
          </h1>
          <p className="text-sm text-muted-foreground">
            Link-building opportunities, most relevant first.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <main className="flex-1">
            <div className={cn("md:border-r", LIST_WIDTH)}>
              <OpportunityListSkeleton />
            </div>
          </main>
        }
      >
        <Inbox searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Inbox({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const filters: InboxFilters = { quality: qualityViewSchema.parse(params.quality) };
  const selectedId = typeof params.id === "string" ? params.id : undefined;

  // The SQLite driver is synchronous. Without connection(), Next.js would run
  // this query at build time and serve the same rows forever.
  await connection();
  const rows = await prisma.opportunity.findMany();
  if (rows.length === 0) {
    return (
      <main className="flex-1">
        <ListEmptyState title="No opportunities yet">
          Run <code className="font-mono">npm run setup</code> to import the seed data.
        </ListEmptyState>
      </main>
    );
  }

  const items = rows
    .map((row) => ({ ...row, issues: getQualityIssues(row) }))
    .sort(compareByRelevance);
  const visible = applyFilters(items, filters);
  // Each count is the number of rows that view would show.
  const countFor = (quality: QualityView) => applyFilters(items, { ...filters, quality }).length;
  // Looked up in all rows, so an open opportunity stays open when a filter hides it.
  const selected = items.find((item) => item.id === selectedId);

  return (
    <main className="flex min-h-0 flex-1">
      {/* On narrow screens the list and the detail take turns; on wide screens both show. */}
      <section
        aria-label="Opportunities"
        className={cn("w-full bg-card md:block md:overflow-y-auto md:border-r", LIST_WIDTH, selectedId && "hidden")}
      >
        <InboxToolbar
          leftToReview={countLeftToReview(visible)}
          quality={filters.quality}
          selectedId={selectedId}
          counts={{ relevant: countFor("relevant"), all: countFor("all"), low: countFor("low") }}
        />
        {visible.length > 0 ? (
          <OpportunityList items={visible} quality={filters.quality} selectedId={selectedId} />
        ) : (
          <ListEmptyState title="No opportunities match the filters">
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href={inboxHref({ quality: "all" })}>Show all opportunities</Link>
            </Button>
          </ListEmptyState>
        )}
      </section>

      <section
        aria-label="Opportunity details"
        className={cn("min-w-0 flex-1 md:overflow-y-auto", !selectedId && "hidden md:block")}
      >
        {selectedId ? (
          <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
            <Button asChild variant="ghost" size="sm" className="-ml-2 md:hidden">
              <Link href={inboxHref({ quality: filters.quality })}>
                <ArrowLeft aria-hidden />
                Back to list
              </Link>
            </Button>
            {selected ? (
              <OpportunityDetail
                opportunity={selected}
                sameDomainIds={findSameDomainIds(rows, selected.id)}
              />
            ) : (
              <ListEmptyState title="Opportunity not found">
                It may have been removed, or the link is wrong.
              </ListEmptyState>
            )}
          </div>
        ) : (
          <p className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            Select an opportunity to see its details.
          </p>
        )}
      </section>
    </main>
  );
}
