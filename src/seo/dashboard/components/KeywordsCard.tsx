import { Search } from "lucide-react";

type Keyword = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type Props = {
  keywords: Keyword[];
};



export function KeywordsCard({ keywords }: Props) {

  const displayedKeywords = keywords
  .sort((a, b) => a.position - b.position)
  .slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">

      <div className="border-b border-border p-5">
        <h2 className="font-semibold">
          Keyword Rankings
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Top performing search queries.
        </p>
      </div>

      {!keywords.length ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No GSC keyword data yet.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayedKeywords.map((keyword) => (
            <div
              key={keyword.query}
              className="flex items-center justify-between p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {keyword.query}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {keyword.impressions.toLocaleString()} impressions
                  {" · "}
                  {(keyword.ctr * 100).toFixed(1)}% CTR
                </p>
              </div>

              <div className="ml-4 text-right">
                <p className="font-semibold">
                  #{keyword.position.toFixed(1)}
                </p>

                <p className="text-xs text-muted-foreground">
                  position
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}