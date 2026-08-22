import { FileSearch } from "lucide-react";

export function RecentAuditsCard() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold">
          Recent Audits
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Your recent website analyses.
        </p>
      </div>

      <div className="flex h-40 items-center justify-center p-5">
        <div className="text-center">
          <FileSearch className="mx-auto h-7 w-7 text-muted-foreground/50" />

          <p className="mt-3 text-sm font-medium">
            No audits yet
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Run your first SEO audit above.
          </p>
        </div>
      </div>
    </div>
  );
}