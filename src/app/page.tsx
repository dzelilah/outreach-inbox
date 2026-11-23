import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { BulkSelectForm } from "@/components/bulk-select-form";
import { Brand, InboxSidebar } from "@/components/inbox-sidebar";
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

const LIST_WIDTH = "md:w-[24rem] md:shrink-0 lg:w-[28rem] xl:w-[30rem]";

export default function InboxPage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col">
          <header className="border-b bg-card px-4 py-3">
            <Brand />
          </header>
          <div className={LIST_WIDTH}>
            <OpportunityListSkeleton />
          </div>
        </div>
      }
    >
      <Inbox searchParams={searchParams} />
    </Suspense>
  );
}

async function Inbox({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const filters: InboxFilters = {
    quality: qualityViewSchema.parse(params.quality),
    hideContacted: params.hideContacted === "1",
  };
  const selectedId = typeof params.id === "string" ? params.id : undefined;

  // The SQLite driver is synchronous. Without connection(), Next.js would run
  // this query at build time and serve the same rows forever.
  await connection();
  const rows = await prisma.opportunity.findMany();
  if (rows.length === 0) {
    return (
      <main className="flex-1">
        <header className="border-b bg-card px-4 py-3">
          <Brand />
        </header>
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
  const leftToReview = countLeftToReview(visible);
  // Each count is the number of rows that view would show.
  const countFor = (quality: QualityView) => applyFilters(items, { ...filters, quality }).length;
  const counts = { relevant: countFor("relevant"), all: countFor("all"), low: countFor("low") };
  // Looked up in all rows, so an open opportunity stays open when a filter hides it.
  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="flex min-h-dvh md:h-dvh">
      <InboxSidebar
        filters={filters}
        counts={counts}
        shown={visible.length}
        leftToReview={leftToReview}
        selectedId={selectedId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b bg-card px-4 py-3 xl:hidden">
          <Brand />
        </header>

        <main className="flex min-h-0 flex-1">
          {/* On narrow screens the list and the detail take turns; on wide screens both show. */}
          <section
            aria-label="Opportunities"
            className={cn("w-full md:block md:overflow-y-auto md:border-r", LIST_WIDTH, selectedId && "hidden")}
          >
            {/* Below xl the filters sit above the list; from xl they are in the sidebar. */}
            <InboxToolbar
              filters={filters}
              leftToReview={leftToReview}
              selectedId={selectedId}
              counts={counts}
            />
            <div className="sticky top-0 z-10 hidden items-baseline justify-between border-b bg-background/95 px-4 py-3 backdrop-blur xl:flex">
              <p className="text-sm font-medium">
                Showing {visible.length} of {items.length} opportunities
              </p>
              <p className="text-xs text-muted-foreground">Most relevant first</p>
            </div>
            {visible.length > 0 ? (
              // The key changes with the filters, so changing a filter starts a fresh selection.
              <BulkSelectForm key={inboxHref(filters)}>
                <OpportunityList items={visible} filters={filters} selectedId={selectedId} />
              </BulkSelectForm>
            ) : (
              <ListEmptyState title="No opportunities match the filters">
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href={inboxHref({ quality: "all", hideContacted: false })}>
                    Show all opportunities
                  </Link>
                </Button>
              </ListEmptyState>
            )}
          </section>

          <section
            aria-label="Opportunity details"
            className={cn("min-w-0 flex-1 md:overflow-y-auto", !selectedId && "hidden md:block")}
          >
            {selectedId ? (
              <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
                <Button asChild variant="ghost" size="sm" className="-ml-2 md:hidden">
                  <Link href={inboxHref(filters)}>
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
      </div>
    </div>
  );
}
