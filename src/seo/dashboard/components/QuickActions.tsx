import {
  FileSearch,
  Search,
  BarChart3,
} from "lucide-react";

type Props = {
  onRunAudit: () => void;
  disabled?: boolean;
};

export function QuickActions({
  onRunAudit,
  disabled,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-semibold">
        Quick Actions
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Action
          icon={<FileSearch />}
          title="Run SEO Audit"
          description="Check your website for technical SEO issues."
          onClick={onRunAudit}
          disabled={disabled}
        />

        <Action
          icon={<Search />}
          title="Track Keywords"
          description="Add keywords and monitor rankings."
        />

        <Action
          icon={<BarChart3 />}
          title="View Reports"
          description="Analyze your SEO performance over time."
        />
      </div>
    </div>
  );
}

function Action({
  icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-start gap-3 rounded-xl border border-border p-4 text-left transition hover:bg-muted disabled:opacity-50"
    >
      <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  );
}