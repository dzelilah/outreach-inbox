import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { InboxToolbar } from "@/components/inbox-toolbar";
import {
  ListEmptyState,
  OpportunityList,
  OpportunityListSkeleton,
} from "@/components/opportunity-list";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { applyFilters, compareByRelevance, getQualityIssues } from "@/lib/quality";

export default function InboxPage({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col md:h-dvh">
      <header className="border-b px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold">Outreach Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Link-building opportunities, most relevant first.
        </p>
      </header>

      <main className="flex min-h-0 flex-1">
        <section
          aria-label="Opportunities"
          className="w-full md:w-[26rem] md:shrink-0 md:overflow-y-auto md:border-r lg:w-[32rem]"
        >
          <Suspense fallback={<OpportunityListSkeleton />}>
            <Opportunities searchParams={searchParams} />
          </Suspense>
        </section>

        <section
          aria-label="Opportunity details"
          className="hidden flex-1 items-center justify-center p-6 md:flex"
        >
          <p className="text-sm text-muted-foreground">Select an opportunity to see its details.</p>
        </section>
      </main>
    </div>
  );
}

async function Opportunities({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  // Low-quality rows are hidden unless the URL has ?showLow=1.
  const { showLow } = await searchParams;
  const filters = { showLowQuality: showLow === "1" };

  // The SQLite driver is synchronous. Without connection(), Next.js would run
  // this query at build time and serve the same rows forever.
  await connection();
  const rows = await prisma.opportunity.findMany();
  if (rows.length === 0) {
    return (
      <ListEmptyState title="No opportunities yet">
        Run <code className="font-mono">npm run setup</code> to import the seed data.
      </ListEmptyState>
    );
  }

  const items = rows
    .map((row) => ({ ...row, issues: getQualityIssues(row) }))
    .sort(compareByRelevance);
  const visible = applyFilters(items, filters);

  return (
    <>
      <InboxToolbar
        showLowQuality={filters.showLowQuality}
        hiddenCount={items.length - visible.length}
      />
      {visible.length > 0 ? (
        <OpportunityList items={visible} />
      ) : (
        <ListEmptyState title="No opportunities match the filters">
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/?showLow=1">Show hidden opportunities</Link>
          </Button>
        </ListEmptyState>
      )}
    </>
  );
}
