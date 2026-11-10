import { CheckCircle2 } from 'lucide-react';

import type { CompetitorPage } from '../types';

type CompetitorPagesListProps = {
  pages: CompetitorPage[];
};

export function CompetitorPagesList({
  pages,
}: CompetitorPagesListProps) {
  return (
    <section className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium">Competitor pages</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Ranking pages used to build the WDF-IDF corpus.
            </p>
          </div>

          <div className="shrink-0 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium">
            {pages.length} pages
          </div>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No competitor pages could be analyzed.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {pages.map((page, index) => (
            <div
              key={page.url}
              className="flex items-center gap-4 p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {page.title || page.url}
                </p>

                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={page.url}
                  className="mt-0.5 block truncate text-xs text-muted-foreground hover:text-primary"
                >
                  {page.url}
                </a>
              </div>

              <div className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                {(page.wordCount ?? 0).toLocaleString()} words
              </div>

              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}