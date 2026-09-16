import { Activity, Gauge, HelpCircle, Zap } from "lucide-react";

type CoreWebVitalsProps = {
  pagespeed?: any;
};

export function CoreWebVitalsCard({ pagespeed }: CoreWebVitalsProps) {
  const score =
    pagespeed?.performanceScore ??
    pagespeed?.performance_score ??
    pagespeed?.score ??
    null;

  const rawLcp = pagespeed?.lcp ?? pagespeed?.largest_contentful_paint;
  const rawCls = pagespeed?.cls ?? pagespeed?.cumulative_layout_shift;
  const rawFcp = pagespeed?.fcp ?? pagespeed?.first_contentful_paint;
  const rawTbt = pagespeed?.tbt ?? pagespeed?.total_blocking_time;

  const lcp = formatMetric(rawLcp, "s");
  const cls = formatMetric(rawCls, "");
  const fcp = formatMetric(rawFcp, "s");
  const tbt = formatMetric(rawTbt, "ms");

  const lcpStatus = getStatus(rawLcp, 2.5, 4.0);
  const clsStatus = getStatus(rawCls, 0.1, 0.25);
  const fcpStatus = getStatus(rawFcp, 1.8, 3.0);
  const tbtStatus = getStatus(rawTbt, 200, 600);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Core Web Vitals
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Lighthouse PageSpeed Insights metrics.
          </p>
        </div>

        {score != null && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-4 text-sm font-bold ${
              score >= 90
                ? "border-green-500 text-green-600 dark:text-green-400"
                : score >= 50
                ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                : "border-destructive text-destructive"
            }`}
          >
            {score}
          </div>
        )}
      </div>

      {!pagespeed ? (
        <div className="mt-6 flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
          <Gauge className="h-6 w-6 text-muted-foreground/50" />
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            PageSpeed data will appear here during crawl runs when PSI is enabled.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricTile
            label="LCP"
            subLabel="Largest Paint"
            value={lcp}
            status={lcpStatus}
          />

          <MetricTile
            label="CLS"
            subLabel="Layout Shift"
            value={cls}
            status={clsStatus}
          />

          <MetricTile
            label="FCP"
            subLabel="First Paint"
            value={fcp}
            status={fcpStatus}
          />

          <MetricTile
            label="TBT"
            subLabel="Blocking Time"
            value={tbt}
            status={tbtStatus}
          />
        </div>
      )}
    </div>
  );
}

function MetricTile({
  label,
  subLabel,
  value,
  status,
}: {
  label: string;
  subLabel: string;
  value: string;
  status: "good" | "needs-improvement" | "poor" | "none";
}) {
  const badgeColors = {
    good: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    "needs-improvement": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    poor: "bg-destructive/10 text-destructive border-destructive/20",
    none: "bg-muted/40 text-muted-foreground border-border",
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">{label}</span>
        <span
          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize ${badgeColors[status]}`}
        >
          {status === "none" ? "—" : status.replace("-", " ")}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold tracking-tight">{value}</p>

      <p className="text-[11px] text-muted-foreground">{subLabel}</p>
    </div>
  );
}

function formatMetric(val: unknown, unit: string): string {
  if (val == null || val === "") return "—";
  if (typeof val === "number") {
    return `${val % 1 === 0 ? val : val.toFixed(2)}${unit ? " " + unit : ""}`;
  }
  return String(val);
}

function getStatus(
  val: unknown,
  goodMax: number,
  poorMin: number
): "good" | "needs-improvement" | "poor" | "none" {
  if (val == null || val === "") return "none";
  const num = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(num)) return "none";
  if (num <= goodMax) return "good";
  if (num >= poorMin) return "poor";
  return "needs-improvement";
}
