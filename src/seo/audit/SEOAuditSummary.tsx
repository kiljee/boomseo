import {
  Activity,
  AlertTriangle,
  FileSearch,
  Globe,
} from "lucide-react";

type Props = {
  audit: any;
};

export function SEOAuditSummary({ audit }: Props) {
  const pages = audit.pages?.length ?? audit.pagesCrawled ?? 0;
  const issues = audit.issues?.length ?? audit.issueCount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <AuditStat
        icon={<Activity className="h-5 w-5" />}
        label="SEO Score"
        value={
          audit.seoScore != null
            ? `${Math.round(audit.seoScore)}/100`
            : "—"
        }
      />

      <AuditStat
        icon={<Globe className="h-5 w-5" />}
        label="Pages Crawled"
        value={String(pages)}
      />

      <AuditStat
        icon={<AlertTriangle className="h-5 w-5" />}
        label="Issues"
        value={String(issues)}
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