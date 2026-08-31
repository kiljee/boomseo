import { Link } from "wasp/client/router";
import { routes } from "wasp/client/router";
import { useQuery } from "wasp/client/operations";
import { getSEOAudits } from "wasp/client/operations";

type SEOAudit = {
  id: string;
  seoScore: number | null;
  pagesCrawled: number | null;
  issueCount: number | null;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
};

export function AuditListPage() {
  const {
    data: audits,
    isLoading,
  } = useQuery(getSEOAudits);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading audits...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        <Link
          to={routes.DashboardRoute.to}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          SEO Audits
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Your recent website audits.
        </p>

        <div className="mt-6">
          Number of audits: {audits?.length ?? 0}
        </div>

        {audits && audits.length > 0 ? (
  <div className="mt-6 space-y-4">
    {audits.map((audit: SEOAudit) => (
      <div
        key={audit.id}
        className="rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              SEO Audit
            </p>

             <p className="mt-1 text-xs text-muted-foreground">
              {audit.completedAt
                ? new Date(audit.completedAt).toLocaleString()
                : audit.startedAt
                  ? new Date(audit.startedAt).toLocaleString()
                  : "Date unavailable"}
            </p>
          </div>

          

          <a
            href={`/audit?id=${audit.id}`}
            className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
          >
            View Audit
          </a>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-bold">
              {audit.seoScore ?? "-"}
            </p>

            <p className="text-xs text-muted-foreground">
              SEO Score
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold">
              {audit.pagesCrawled ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Pages crawled
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold">
              {audit.issueCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Issues
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold">
              {audit.status}
            </p>
            <p className="text-xs text-muted-foreground">
              Status
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center">
    <p className="font-medium">
      No audits yet
    </p>

    <p className="mt-1 text-sm text-muted-foreground">
      Run an SEO audit from the dashboard to see it here.
    </p>
  </div>
)}

      </main>
    </div>
  );
}