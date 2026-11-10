import {
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import type { ArticleWdfIdfTerm } from '../types';

type ContentGapAnalysisProps = {
  underusedTerms: ArticleWdfIdfTerm[];
  overusedTerms: ArticleWdfIdfTerm[];
};

export function ContentGapAnalysis({
  underusedTerms,
  overusedTerms,
}: ContentGapAnalysisProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TermList
        title="Potentially underused"
        description="Terms whose WDF-IDF weight is below the competitor average."
        terms={underusedTerms}
        icon="down"
        emptyMessage="No underused terms found."
      />

      <TermList
        title="Potentially overused"
        description="Terms whose WDF-IDF weight is above the competitor average."
        terms={overusedTerms}
        icon="up"
        emptyMessage="No overused terms found."
      />
    </div>
  );
}

type TermListProps = {
  title: string;
  description: string;
  terms: ArticleWdfIdfTerm[];
  icon: 'up' | 'down';
  emptyMessage: string;
};

function TermList({
  title,
  description,
  terms,
  icon,
  emptyMessage,
}: TermListProps) {
  const Icon = icon === 'down' ? TrendingDown : TrendingUp;

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />

          <h2 className="font-medium">{title}</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="p-5">
        {terms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {terms.map((term) => (
              <div
                key={term.term}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-4 py-3"
              >
                <span className="min-w-0 truncate text-sm font-medium">
                  {term.term}
                </span>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {term.articleWeight.toFixed(4)}
                  {' → '}
                  {term.competitorAverage.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}