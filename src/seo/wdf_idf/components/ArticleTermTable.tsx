import type { ArticleWdfIdfTerm } from '../types';

type ArticleTermTableProps = {
  terms: ArticleWdfIdfTerm[];
  underusedTerms: ArticleWdfIdfTerm[];
  overusedTerms: ArticleWdfIdfTerm[];
};

type TermStatus = 'Missing' | 'Underused' | 'Overused' | 'In range';

const STATUS_CLASSES: Record<TermStatus, string> = {
  Missing:
    'border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-slate-300',
  Underused:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Overused:
    'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  'In range':
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

function getTermStatus(
  term: ArticleWdfIdfTerm,
  underusedSet: Set<string>,
  overusedSet: Set<string>,
): TermStatus {
  if (term.articleWeight <= 0) {
    return 'Missing';
  }

  const normalizedTerm = term.term.toLowerCase();

  if (underusedSet.has(normalizedTerm)) {
    return 'Underused';
  }

  if (overusedSet.has(normalizedTerm)) {
    return 'Overused';
  }

  return 'In range';
}

function formatScore(value: number) {
  return Number.isFinite(value) ? value.toFixed(5) : '—';
}

export function ArticleTermTable({
  terms,
  underusedTerms,
  overusedTerms,
}: ArticleTermTableProps) {
  const underusedSet = new Set(
    underusedTerms.map((term) => term.term.toLowerCase()),
  );

  const overusedSet = new Set(
    overusedTerms.map((term) => term.term.toLowerCase()),
  );

  const sortedTerms = [...terms].sort(
    (a, b) => b.competitorAverage - a.competitorAverage,
  );

  if (!sortedTerms.length) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No terms are available for comparison.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-medium">Term comparison</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Terms are ordered by competitor-average WDF-IDF score.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Term
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Your score
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Competitor average
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Difference
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedTerms.map((term) => {
              const status = getTermStatus(
                term,
                underusedSet,
                overusedSet,
              );

              return (
                <tr
                  key={term.term}
                  className="border-t border-border transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">
                    {term.term}
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatScore(term.articleWeight)}
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatScore(term.competitorAverage)}
                  </td>

                  <td
                    className={`px-4 py-3 text-right tabular-nums ${
                      term.difference < 0
                        ? 'text-amber-600'
                        : term.difference > 0
                          ? 'text-rose-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {term.difference > 0 ? '+' : ''}
                    {formatScore(term.difference)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}