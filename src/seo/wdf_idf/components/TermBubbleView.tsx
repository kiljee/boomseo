import type { ArticleWdfIdfTerm } from '../types';

type TermBubbleViewProps = {
  terms: ArticleWdfIdfTerm[];
  underusedTerms: ArticleWdfIdfTerm[];
  overusedTerms: ArticleWdfIdfTerm[];
};

type BubbleStatus = 'missing' | 'underused' | 'overused' | 'in-range';

const STATUS_STYLES: Record<
  BubbleStatus,
  {
    label: string;
    className: string;
  }
> = {
  missing: {
    label: 'Missing',
    className:
      'border-slate-400/50 bg-slate-500/10 text-slate-600 dark:text-slate-300',
  },
  underused: {
    label: 'Underused',
    className:
      'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  overused: {
    label: 'Overused',
    className:
      'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  },
  'in-range': {
    label: 'In range',
    className:
      'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
};

function getStatus(
  term: ArticleWdfIdfTerm,
  underusedSet: Set<string>,
  overusedSet: Set<string>,
): BubbleStatus {
  if (term.articleWeight <= 0) {
    return 'missing';
  }

  const normalizedTerm = term.term.toLowerCase();

  if (underusedSet.has(normalizedTerm)) {
    return 'underused';
  }

  if (overusedSet.has(normalizedTerm)) {
    return 'overused';
  }

  return 'in-range';
}

function formatScore(value: number) {
  return Number.isFinite(value) ? value.toFixed(5) : '—';
}

export function TermBubbleView({
  terms,
  underusedTerms,
  overusedTerms,
}: TermBubbleViewProps) {
  const underusedSet = new Set(
    underusedTerms.map((term) => term.term.toLowerCase()),
  );

  const overusedSet = new Set(
    overusedTerms.map((term) => term.term.toLowerCase()),
  );

  const sortedTerms = [...terms]
    .sort(
      (a, b) => b.competitorAverage - a.competitorAverage,
    )
    .slice(0, 40);

  const maxScore = Math.max(
    ...sortedTerms.map((term) =>
      Math.max(0, term.competitorAverage),
    ),
    0,
  );

  if (!sortedTerms.length) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No terms are available for comparison.
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}

      <div className="mb-5 flex flex-wrap gap-3">
        {(
          Object.entries(STATUS_STYLES) as [
            BubbleStatus,
            (typeof STATUS_STYLES)[BubbleStatus],
          ][]
        ).map(([status, config]) => (
          <div
            key={status}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full border ${config.className}`}
            />

            {config.label}
          </div>
        ))}
      </div>

      {/* Bubbles */}

      <div className="flex flex-wrap items-center justify-center gap-3 py-6">
        {sortedTerms.map((term) => {
          const status = getStatus(
            term,
            underusedSet,
            overusedSet,
          );

            console.log({
              term: term.term,
              articleWeight: term.articleWeight,
              lowerBound: term.lowerBound,
              upperBound: term.upperBound,
              difference: term.difference,
            });

          const style = STATUS_STYLES[status];

          const ratio =
            maxScore > 0
              ? Math.max(0, term.competitorAverage) / maxScore
              : 0;

          const size = Math.round(76 + Math.sqrt(ratio) * 54);

          return (
            <button
              key={term.term}
              type="button"
              title={[
                term.term,
                `Status: ${style.label}`,
                `Your score: ${formatScore(term.articleWeight)}`,
                `Competitor average: ${formatScore(term.competitorAverage)}`,
                `Difference: ${formatScore(term.difference)}`,


              ].join('\n')}
              className={`flex shrink-0 flex-col items-center justify-center rounded-full border p-2 text-center transition duration-200 hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${style.className}`}
              style={{
                width: size,
                height: size,
              }}
            >
              <span className="max-w-full break-words px-1 text-xs font-semibold leading-tight sm:text-sm">
                {term.term}
              </span>

              <span className="mt-1 text-[10px] opacity-75 sm:text-xs">
                {style.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Showing up to 40 terms, ordered by competitor-average WDF-IDF
        score. Hover over a bubble to see the comparison values.
        Bubble size reflects the relative competitor-average score,
        not raw occurrence frequency.
      </p>
    </div>
  );
}