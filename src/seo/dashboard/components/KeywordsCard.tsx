import { Search } from "lucide-react";

export function KeywordsCard() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold">
          Keyword Rankings
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Track your most important keywords.
        </p>
      </div>

      <div className="flex h-40 items-center justify-center p-5">
        <div className="text-center">
          <Search className="mx-auto h-7 w-7 text-muted-foreground/50" />

          <p className="mt-3 text-sm font-medium">
            No keywords tracked
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            GSC data will populate this section.
          </p>
        </div>
      </div>
    </div>
  );
}