"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
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

export function InboxToolbar({ quality, counts }: InboxToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  // The selection moves at once; the filtered list arrives from the server a moment later.
  const [optimisticQuality, setOptimisticQuality] = useOptimistic(quality);

  function selectQuality(view: QualityView) {
    // Keep the other URL params and change only this filter. The default view needs no param.
    const params = new URLSearchParams(searchParams.toString());
    if (view === "relevant") params.delete("quality");
    else params.set("quality", view);
    const query = params.toString();

    startTransition(() => {
      setOptimisticQuality(view);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="sticky top-0 z-10 flex h-12 items-center border-b bg-background px-4 md:px-6">
      <div role="group" aria-label="Filter by quality" className="inline-flex rounded-lg bg-muted p-0.5">
        {QUALITY_VIEWS.map((view) => {
          const selected = view === optimisticQuality;
          return (
            <button
              key={view}
              type="button"
              aria-pressed={selected}
              onClick={() => selectQuality(view)}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
