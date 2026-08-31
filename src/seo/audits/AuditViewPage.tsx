import { useQuery } from "wasp/client/operations";
import { getSEOAudit } from "wasp/client/operations";

export function AuditViewPage() {
  const params = new URLSearchParams(
    window.location.search
  );

  const analysisId = params.get("id");

  const { data: audit, isLoading } = useQuery(
    getSEOAudit,
    {
      analysisId: analysisId!,
    },
    {
      enabled: !!analysisId,
    }
  );

  if (!analysisId) {
    return (
      <div className="p-8">
        No audit ID provided.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        Loading audit...
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="p-8">
        Audit not found.
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">
        SEO Audit
      </h1>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p>
          Score: {audit.seoScore ?? "-"}
        </p>

        <p>
          Pages: {audit.pagesCrawled ?? 0}
        </p>

        <p>
          Issues: {audit.issueCount ?? 0}
        </p>

        <p>
          Status: {audit.status}
        </p>
      </div>
    </main>
  );
}