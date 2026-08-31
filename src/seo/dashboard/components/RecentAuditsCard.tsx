import { FileSearch, ArrowUpRight } from "lucide-react";
import { Link, routes } from "wasp/client/router";

type Props = {
  audits: any[];
  auditsLoading: boolean;
};

export function RecentAuditsCard({
  audits,
  auditsLoading,
}: Props) {
  const recentAudits = audits.slice(0, 5);

  return (
    <div className="h-full rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h2 className="font-semibold">
            Recent Audits
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Your recent website analyses.
          </p>
        </div>

        <Link
          to={routes.AuditListRoute.to}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {auditsLoading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading audits...
        </div>
      ) : recentAudits.length === 0 ? (
        <div className="flex h-40 items-center justify-center p-5">
          <div className="text-center">
            <FileSearch className="mx-auto h-7 w-7 text-muted-foreground/50" />

            <p className="mt-3 text-sm font-medium">
              No audits yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Run your first SEO audit above.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recentAudits.map((audit) => (
            <a
              key={audit.id}
              href={`/audit?id=${audit.id}`}
              className="block p-5 transition hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    SEO Audit
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {audit.completedAt
                      ? new Date(
                          audit.completedAt
                        ).toLocaleString()
                      : "Recently completed"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {audit.seoScore ?? "-"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    SEO Score
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>
                  {audit.pagesCrawled ?? 0} pages
                </span>

                <span>
                  {audit.issueCount ?? 0} issues
                </span>

                <span>
                  {audit.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}