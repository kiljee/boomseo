import type { AnalysisResult } from '../types';

type AnalysisSummaryProps = {
  research: AnalysisResult;
  displayedTerms: number;
};

export function AnalysisSummary({
  research,
  displayedTerms,
}: AnalysisSummaryProps) {
  const cards = [
    {
      label: 'Terms discovered',
      value: research.wdfIdf.length,
      description: 'Terms found in the competitor corpus',
    },
    {
      label: 'Competitor pages',
      value: research.competitorPages.length,
      description: 'Pages included in the analysis',
    },
    {
      label: 'Terms displayed',
      value: displayedTerms,
      description: 'Terms included in the chart',
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">
            {card.label}
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {card.value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}