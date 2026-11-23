"use client"; // Error boundaries must be Client Components.

import { Button } from "@/components/ui/button";

/** Shown when the page throws, for example when the database was never set up. */
export default function InboxError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-lg font-semibold">The inbox could not be loaded</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        If this is a fresh checkout, run <code className="font-mono">npm run setup</code> to create
        the database, then try again.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </main>
  );
}
