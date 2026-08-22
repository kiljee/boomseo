import { useQuery } from "wasp/client/operations";
import { getLatestSEOAudit } from "wasp/client/operations";

import { SEOAuditSummary } from "./SEOAuditSummary";
import { SEOAuditIssues } from "./SEOAuditIssues";
import { SEOAuditPages } from "./SEOAuditPages";

export function SEOAuditPage() {
  const {
    data: audit,
    isLoading,
  } = useQuery(getLatestSEOAudit);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading SEO audit...
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">
          No SEO audit yet
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Run a website analysis first to see your SEO audit.
        </p>
      </div>
    );
  }

  const pages = audit.pages ?? [];
  const issues = audit.issues ?? [];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Latest SEO Audit
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Overview of your latest website analysis.
          </p>

          {audit.completedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Completed{" "}
              {new Date(audit.completedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-8">
          <SEOAuditSummary audit={audit} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SEOAuditIssues issues={issues} />
          <SEOAuditPages pages={pages} />
        </div>

      </main>
    </div>
  );
}