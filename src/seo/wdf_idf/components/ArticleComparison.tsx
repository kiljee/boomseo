import {
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import type { ArticleWdfIdfTerm } from '../types';

type ArticleComparisonProps = {
  terms: ArticleWdfIdfTerm[];
  maxScore: number;
};

export function ArticleComparison({
  terms,
  maxScore,
}: ArticleComparisonProps) {
  const sortedTerms = [...terms]
    .sort(
      (a, b) =>
        Math.abs(b.difference) - Math.abs(a.difference)
    )
    .slice(0, 30);

  return (
    <section className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-medium">
          Your content vs. competitors
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Compare your article's WDF-IDF weights with the
          competitor averages.
        </p>
      </div>

      <div className="p-5">
        {sortedTerms.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No comparable terms found.
          </p>
        ) : (
          <div className="space-y-5">
            {sortedTerms.map((term) => {
              const yourWidth =
                maxScore > 0
                  ? (term.articleWeight / maxScore) * 100
                  : 0;

              const competitorWidth =
                maxScore > 0
                  ? (term.competitorAverage / maxScore) * 100
                  : 0;

              const isUnderused = term.difference < 0;

              return (
                <div key={term.term}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {term.term}
                      </span>

                      {isUnderused ? (
                        <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>

                    <span
                      className={`shrink-0 text-xs font-medium ${
                        isUnderused
                          ? 'text-muted-foreground'
                          : 'text-primary'
                      }`}
                    >
                      {term.difference >= 0 ? '+' : ''}
                      {term.difference.toFixed(5)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <ComparisonBar
                      label="Your text"
                      value={term.articleWeight}
                      width={yourWidth}
                    />

                    <ComparisonBar
                      label="Competitors"
                      value={term.competitorAverage}
                      width={competitorWidth}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

type ComparisonBarProps = {
  label: string;
  value: number;
  width: number;
};

function ComparisonBar({
  label,
  value,
  width,
}: ComparisonBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>

      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${width}%` }}
        />
      </div>

      <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
        {value.toFixed(4)}
      </span>
    </div>
  );
}