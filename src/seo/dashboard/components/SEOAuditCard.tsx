import {
  Activity,
  CheckCircle2,
  Loader2,
  Play,
  XCircle,
} from "lucide-react";

type Props = {
  analysis: any;
  crawl: any;
  starting: boolean;
  onStart: () => void;
};

export function SEOAuditCard({
  analysis,
  crawl,
  starting,
  onStart,
}: Props) {
  const status = crawl?.status ?? analysis?.status;
  const progress = Math.round(crawl?.progress ?? 0);

  const running =
    status === "RUNNING" ||
    status === "running" ||
    status === "crawling";

  const completed =
    status === "COMPLETED" ||
    status === "completed";

  const failed =
    status === "FAILED" ||
    status === "failed";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            {running ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : completed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : failed ? (
              <XCircle className="h-5 w-5" />
            ) : (
              <Activity className="h-5 w-5" />
            )}
          </div>

          <div>
            <h2 className="font-semibold">
              Website SEO Audit
            </h2>

            <p className="text-xs text-muted-foreground">
              {running
                ? "Analyzing your website..."
                : completed
                  ? "Analysis complete."
                  : failed
                    ? "Analysis failed."
                    : "Run an audit to analyze your website."}
            </p>
          </div>
        </div>


    

              {!running && (
        <button
          onClick={onStart}
          disabled={starting}
          className="cta-button inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Play className="h-4 w-4" />

          {starting
            ? "Running..."
            : completed
              ? "Run Again"
              : "Run SEO Audit"}
        </button>
      )}
      </div>

      {running && (
        <div className="mt-6">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Crawling website</span>
            <span>{progress}%</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Crawled"
              value={crawl?.stats?.crawled ?? 0}
            />

            <Stat
              label="Discovered"
              value={crawl?.stats?.discovered ?? 0}
            />

            <Stat
              label="Issues"
              value={
                Array.isArray(crawl?.issues)
                  ? crawl.issues.length
                  : typeof crawl?.issues === "number"
                  ? crawl.issues
                  : 0
              }
            />

            <Stat
              label="Speed"
              value={
                crawl?.stats?.speed
                  ? `${crawl.stats.speed.toFixed(1)}/s`
                  : "-"
              }
            />
          </div>
        </div>
      )}

      {completed && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Pages"
            value={analysis?.pagesCrawled ?? 0}
          />

          <Stat
            label="SEO Score"
            value={analysis?.seoScore ?? "-"}
          />

          <Stat
            label="Issues"
            value={analysis?.issueCount ?? 0}
          />

          <Stat
            label="Status"
            value="Complete"
          />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}