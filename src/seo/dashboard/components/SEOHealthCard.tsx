import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Props = {
  score: number | null;
  issueCount?: number;
  issues?: any[];
};

export function SEOHealthCard({
  score,
  issueCount = 0,
  issues = [],
}: Props) {
  const warnings = issues.filter(
    (issue) => issue.type?.toLowerCase() === "warning"
  ).length;

  const errors = issues.filter(
    (issue) =>
      issue.type?.toLowerCase() === "error" ||
      issue.type?.toLowerCase() === "critical"
  ).length;

  console.log(issues);

  const passed =
    score != null
      ? Math.max(0, 100 - warnings - errors)
      : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold">
            SEO Health
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Latest site audit
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-border text-sm font-bold">
          {score ?? "-"}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Row
          icon={<CheckCircle2 />}
          label="Passed"
          value={score != null ? passed : "—"}
        />

        <Row
          icon={<AlertTriangle />}
          label="Warnings"
          value={score != null ? warnings : "—"}
        />

        <Row
          icon={<XCircle />}
          label="Errors"
          value={score != null ? errors : "—"}
        />
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-4 w-4 text-muted-foreground">
          {icon}
        </span>

        {label}
      </div>

      <span className="text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}