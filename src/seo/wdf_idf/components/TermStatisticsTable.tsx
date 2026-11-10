import type { ChartTerm } from '../types';

type TermStatisticsTableProps = {
  data: ChartTerm[];
  totalCompetitors: number;
};

export function TermStatisticsTable({
  data,
  totalCompetitors,
}: TermStatisticsTableProps) {
  return (
    <section className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-medium">Term statistics</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Detailed WDF-IDF statistics for the most prominent terms.
        </p>
      </div>

      {data.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          No term statistics available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left font-medium">
                  Term
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Average (Total)
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Average (Used)
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Maximum
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Minimum
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Competitors
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {data.map((term) => (
                <tr
                  key={term.term}
                  className="transition hover:bg-muted/30"
                >
                  <td className="px-5 py-3 font-medium">
                    {term.term}
                  </td>

                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {term.averageTotal.toFixed(5)}
                  </td>

                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {term.averageUsed.toFixed(5)}
                  </td>

                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {term.maximum.toFixed(5)}
                  </td>

                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {term.minimum.toFixed(5)}
                  </td>

                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {term.competitors}/{totalCompetitors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}