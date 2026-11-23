"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type InboxToolbarProps = {
  showLowQuality: boolean;
  /** How many rows the current filters hide. */
  hiddenCount: number;
};

export function InboxToolbar({ showLowQuality, hiddenCount }: InboxToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  // The switch flips at once; the filtered list arrives from the server a moment later.
  const [optimisticShowLowQuality, setOptimisticShowLowQuality] = useOptimistic(showLowQuality);

  function setShowLowQuality(show: boolean) {
    // Keep the other URL params and change only this filter.
    const params = new URLSearchParams(searchParams.toString());
    if (show) params.set("showLow", "1");
    else params.delete("showLow");
    const query = params.toString();

    startTransition(() => {
      setOptimisticShowLowQuality(show);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="sticky top-0 z-10 flex h-11 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Switch
          id="hide-low-quality"
          checked={!optimisticShowLowQuality}
          onCheckedChange={(hide) => setShowLowQuality(!hide)}
        />
        <Label htmlFor="hide-low-quality" className="font-normal">
          Hide low-quality
        </Label>
      </div>

      {!optimisticShowLowQuality && hiddenCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {hiddenCount} hidden ·{" "}
          <Button variant="link" className="h-auto p-0" onClick={() => setShowLowQuality(true)}>
            Show
          </Button>
        </p>
      )}
    </div>
  );
}
