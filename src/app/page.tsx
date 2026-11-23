import { connection } from "next/server";
import { Suspense } from "react";
import { OpportunityList, OpportunityListSkeleton } from "@/components/opportunity-list";
import { prisma } from "@/lib/db";
import { compareByRelevance, getQualityIssues } from "@/lib/quality";

export default function InboxPage() {
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
            <Opportunities />
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

async function Opportunities() {
  // The SQLite driver is synchronous. Without connection(), Next.js would run
  // this query at build time and serve the same rows forever.
  await connection();
  const rows = await prisma.opportunity.findMany();
  const items = rows
    .map((row) => ({ ...row, issues: getQualityIssues(row) }))
    .sort(compareByRelevance);

  return <OpportunityList items={items} />;
}
