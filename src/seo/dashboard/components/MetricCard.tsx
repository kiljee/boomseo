import type { ReactNode } from "react";

type Status = "good" | "warning" | "bad";

type Props = {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  status?: Status;
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  status,
}: Props) {
  const statusClasses = {
    good: "border-green-500/50",
    warning: "border-orange-500/50",
    bad: "border-red-500/50",
  };

  return (
    <div
      className={`rounded-2xl border bg-card p-5 shadow-sm ${
        status ? statusClasses[status] : "border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {title}
        </span>

        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}