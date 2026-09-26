import {
  Activity,
  AlertTriangle,
  FileSearch,
  Globe,
  Zap,
  Search,
  TrendingUp
} from "lucide-react";

import { MetricCard } from "../dashboard/components/MetricCard";

type Props = {
  audit: any;
};

export function SEOAuditSummary({ audit }: Props) {
  const pages = audit.pages?.length ?? audit.pagesCrawled ?? 0;
  const issues = audit.issues?.length ?? audit.issueCount ?? 0;

  const validSpeeds = (audit.pages ?? [])
    .map((p: any) => p.responseTime)
    .filter((t: any) => typeof t === "number" && t > 0);

  const avgSpeed =
    validSpeeds.length > 0
      ? Math.round(validSpeeds.reduce((a: number, b: number) => a + b, 0) / validSpeeds.length)
      : null;

  return (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
              title="SEO Health"
              value={
                audit.seoScore != null
            ? `${Math.round(audit.seoScore)}/100`
            : "—"
              }
              description={
                  ""
              }
              icon={<Activity className="h-5 w-5" />}
              status={
                audit.seoScore == null
                  ? undefined
                  : audit.seoScore >= 80
                    ? "good"
                    : audit.seoScore >= 50
                      ? "warning"
                      : "bad"
              }
            />

          <MetricCard
            title="Pages Crawled"
            value={String(pages)}
            description={
              "Pages analyzed"
            }
            icon={<Globe className="h-5 w-5" />}
          />

          <MetricCard
              title="SEO Issues"
              value={String(issues)}
              description="Issues found"
              icon={<AlertTriangle className="h-5 w-5" />}
              status={
                issues === 0
                  ? "good"
                  : issues <= 15
                    ? "warning"
                    : "bad"
              }
            />

          <MetricCard
              title="Avg Response Time"
              value={avgSpeed != null ? `${avgSpeed} ms` : "—"}
              description={"Avg page response time"}
              icon={<TrendingUp className="h-5 w-5" />}
              status={
                avgSpeed == null
                  ? undefined
                  : avgSpeed < 500
                    ? "good"
                    : avgSpeed < 1000
                      ? "warning"
                      : "bad"
              }
            />
        </div>
  );
}

function AuditStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {label}
        </span>

        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}