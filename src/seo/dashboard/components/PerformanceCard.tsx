import { BarChart3 } from "lucide-react";

export function PerformanceCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
      <h2 className="font-semibold">
        Organic Performance
      </h2>

      <p className="mt-1 text-xs text-muted-foreground">
        Search Console data will appear here.
      </p>

      <div className="mt-8 flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
        <div className="text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/50" />

          <p className="mt-3 text-sm font-medium">
            No performance data yet
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Connect Google Search Console to see traffic data.
          </p>
        </div>
      </div>
    </div>
  );
}