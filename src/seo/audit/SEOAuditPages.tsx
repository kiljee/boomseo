import { FileSearch } from "lucide-react";

type Props = {
  pages: any[];
};

export function SEOAuditPages({ pages }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold">
          Crawled Pages
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Pages discovered during the latest audit.
        </p>
      </div>

      {pages.length === 0 ? (
        <div className="p-8 text-center">
          <FileSearch className="mx-auto h-7 w-7 text-muted-foreground/50" />

          <p className="mt-3 text-sm font-medium">
            No pages found
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {pages.map((page) => (
            <div
              key={page.id}
              className="p-5"
            >
              <p className="truncate text-sm font-medium">
                {page.title || page.url}
              </p>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                {page.url}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Status: {page.statusCode ?? "—"}
                </span>

                <span>
                  Words: {page.wordCount ?? "—"}
                </span>

                <span>
                  Links: {page.internalLinks ?? "—"}
                </span>

                {page.responseTime != null && (
                  <span className="flex items-center gap-1 font-medium">
                    Speed:
                    <span
                      className={
                        page.responseTime < 500
                          ? "text-green-600 dark:text-green-400"
                          : page.responseTime < 1500
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-destructive"
                      }
                    >
                      {Math.round(page.responseTime)} ms
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}