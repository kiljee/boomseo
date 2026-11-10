import { useEffect } from 'react';
import { X, Tags } from 'lucide-react';

import type { ChartTerm } from '../types';

type TopTermsDialogProps = {
  open: boolean;
  onClose: () => void;
  terms: ChartTerm[];
};

function formatScore(value: number) {
  return Number.isFinite(value) ? value.toFixed(5) : '—';
}

export function TopTermsDialog({
  open,
  onClose,
  terms,
}: TopTermsDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sortedTerms = [...terms].sort(
    (a, b) => b.averageTotal - a.averageTotal,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="top-terms-title"
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Tags className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2
                id="top-terms-title"
                className="text-lg font-semibold"
              >
                Top competitor terms
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {sortedTerms.length} terms ranked by average WDF-IDF
                score.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close top terms"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Explanation */}

        <div className="border-b border-border bg-muted/20 px-5 py-3 sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Higher average WDF-IDF scores appear first. This ranking
            does not represent raw term frequency or the percentage
            of competitors containing each term.
          </p>
        </div>

        {/* Table */}

        <div className="min-h-0 flex-1 overflow-auto">
          {sortedTerms.length ? (
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-muted">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    #
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Term
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Average score
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Minimum
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Maximum
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedTerms.map((term, index) => (
                  <tr
                    key={term.term}
                    className="border-t border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3 text-muted-foreground tabular-nums">
                      {index + 1}
                    </td>

                    <td className="px-5 py-3 font-medium">
                      {term.term}
                    </td>

                    <td className="px-5 py-3 text-right font-medium tabular-nums">
                      {formatScore(term.averageTotal)}
                    </td>

                    <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">
                      {formatScore(term.minimum)}
                    </td>

                    <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">
                      {formatScore(term.maximum)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex min-h-48 items-center justify-center px-6 text-sm text-muted-foreground">
              No terms are available.
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex justify-end border-t border-border p-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}