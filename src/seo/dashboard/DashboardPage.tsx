import { useEffect, useState } from "react";
import { Link, routes } from "wasp/client/router";
import { useAction, useQuery } from "wasp/client/operations";
import {
  getCurrentOrganization,
  leaveOrganization,
  startSEOAnalysis,
  getSEOAnalysisStatus,
  getLatestSEOAudit,
  getSEOAudits
} from "wasp/client/operations";
import { useNavigate } from "react-router";

import { SEOHealthCard } from "./components/SEOHealthCard";
import { SEOAuditCard } from "./components/SEOAuditCard";
import { PerformanceCard } from "./components/PerformanceCard";
import { KeywordsCard } from "./components/KeywordsCard";
import { RecentAuditsCard } from "./components/RecentAuditsCard";
import { QuickActions } from "./components/QuickActions";
import { MetricCard } from "./components/MetricCard";
import { CoreWebVitalsCard } from "./components/CoreWebVitalsCard";
import { getGSCStats } from "wasp/client/operations";

import {
  Activity,
  BarChart3,
  Globe,
  Search,
  TrendingUp,
  FileText
} from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: organization, isLoading } =
    useQuery(getCurrentOrganization);

  const startAnalysis = useAction(startSEOAnalysis);
  const leaveWorkspace = useAction(leaveOrganization);

  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  /*const { data: analysisStatus } = useAction(
    syncSEOAnalysis,
    { analysisId: analysisId! },
    {
      enabled: !!analysisId,
      refetchInterval: 1500,
    }
  );*/

  const {
    data: latestAudit,
    isLoading: auditLoading,
    refetch: refetchLatestAudit,
  } = useQuery(getLatestSEOAudit);

  const {
    data: audits,
    isLoading: auditsLoading,
    refetch: refetchAudits
  } = useQuery(getSEOAudits);

  console.log({
    audits,
    auditsLoading
  });

  const {
    data: gscStats,
    isLoading: gscLoading
  } = useQuery(getGSCStats);

  // If there's an active running analysis in audits, automatically resume tracking it
  useEffect(() => {
    if (!analysisId && audits && audits.length > 0) {
      const runningAudit = audits.find((a: any) => a.status === "RUNNING");
      if (runningAudit) {
        setAnalysisId(runningAudit.id);
      }
    }
  }, [audits, analysisId]);

  // Poll analysis status reactively while it is running
  const { data: analysisStatus } = useQuery(
    getSEOAnalysisStatus,
    { analysisId: analysisId! },
    {
      enabled: !!analysisId,
      refetchInterval: (data: any) => {
        if (!data) return 2000;
        const isStillRunning =
          data.status === "running" ||
          data.analysis?.status === "RUNNING" ||
          data.crawl?.status === "running" ||
          data.crawl?.status === "in_progress";
        return isStillRunning ? 2000 : false;
      },
    }
  );

  // When analysis finishes, refetch latest audit and audit history
  useEffect(() => {
    if (
      analysisStatus?.completed ||
      analysisStatus?.analysis?.status === "COMPLETED" ||
      analysisStatus?.analysis?.status === "FAILED"
    ) {
      refetchLatestAudit();
      refetchAudits();
      setStarting(false);
    }
  }, [analysisStatus?.completed, analysisStatus?.analysis?.status]);

  async function handleStartAnalysis() {
    if (starting) return;

    setStarting(true);

    try {
      const result = await startAnalysis({});
      setAnalysisId(result.analysisId);
    } catch (error) {
      console.error("Failed to start SEO analysis:", error);
      setStarting(false);
    }
  }

  async function handleViewPlan() {
    navigate(routes.ViewSEOPlanRoute.to);
  }

  async function handleGenerate() {
    navigate(routes.NewArticleRoute.to);
  }

  async function handleLeaveWorkspace() {
    if (
      !confirm(
        "Are you sure you want to leave this workspace?"
      )
    ) {
      return;
    }

    await leaveWorkspace({});
    navigate(routes.WorkspacesRoute.to);
    window.location.reload();
  }

  async function runGetStatus() {
    //await getCrawlStatusQuery({analysisId:"5"});
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            No organization selected
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Select a workspace to continue.
          </p>
        </div>
      </div>
    );
  }

  console.log(latestAudit);

  console.log("ORGANIZATION:", organization);
console.log("WEBSITE URL:", organization.websiteUrl);

  const crawl = analysisStatus?.crawl;
  const analysis = analysisStatus?.analysis;

  const isRunning =
    analysis?.status === "RUNNING" &&
    crawl?.status !== "completed";

  const dashboardStats = {
    score: isRunning
      ? null
      : latestAudit?.seoScore ?? analysis?.seoScore ?? null,

    pages: isRunning
      ? crawl?.stats?.crawled ?? 0
      : latestAudit?.pagesCrawled ?? analysis?.pagesCrawled ?? 0,

    issues: isRunning
      ? crawl?.issues ?? 0
      : latestAudit?.issueCount ?? analysis?.issueCount ?? 0,

    speed: isRunning
      ? crawl?.stats?.speed ?? null
      : null,

    progress: Math.round(crawl?.progress ?? 0),
  };

  const validTimes = (latestAudit?.pages ?? [])
    .map((p: any) => p.responseTime)
    .filter((t: any) => typeof t === "number" && t > 0);

  const avgResponseMs =
    validTimes.length > 0
      ? Math.round(
          validTimes.reduce((a: number, b: number) => a + b, 0) /
            validTimes.length
        )
      : null;

  const latestPagespeedData =
    analysisStatus?.pagespeed ??
    (latestAudit?.issues as any[])?.find(
      (i: any) => i.type === "pagespeed_summary"
    )?.details ??
    (latestAudit?.issues as any[])?.find(
      (i: any) =>
        i.details?.pagespeed ||
        i.details?.lcp ||
        i.details?.performanceScore
    )?.details?.pagespeed ??
    null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {organization.name} Dashboard
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Monitor and improve your website SEO performance.
            </p>
          </div>
        </div>

        {/* Website */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                {organization.websiteUrl ?? "No website connected"}
              </p>

              <p className="text-xs text-muted-foreground">
                {organization.websiteUrl
                  ? "Website connected"
                  : "Add a website to start collecting SEO data."}
              </p>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
              title="SEO Health"
              value={
                dashboardStats.score != null
                  ? `${dashboardStats.score}`
                  : "-"
              }
              description={
                dashboardStats.score != null
                  ? "Latest SEO score"
                  : "Run your first audit"
              }
              icon={<Activity className="h-5 w-5" />}
              status={
                dashboardStats.score == null
                  ? undefined
                  : dashboardStats.score >= 80
                    ? "good"
                    : dashboardStats.score >= 50
                      ? "warning"
                      : "bad"
              }
            />

          <MetricCard
            title="Pages Crawled"
            value={`${dashboardStats.pages}`}
            description={
              isRunning
                ? `${dashboardStats.progress}% complete`
                : "Pages analyzed"
            }
            icon={<Globe className="h-5 w-5" />}
          />

          <MetricCard
              title="SEO Issues"
              value={`${dashboardStats.issues}`}
              description="Issues found"
              icon={<Search className="h-5 w-5" />}
              status={
                dashboardStats.issues === 0
                  ? "good"
                  : dashboardStats.issues <= 15
                    ? "warning"
                    : "bad"
              }
            />

          <MetricCard
              title="Avg Response Time"
              value={
                isRunning
                  ? dashboardStats.speed != null
                    ? `${dashboardStats.speed.toFixed(1)} p/s`
                    : "-"
                  : avgResponseMs != null
                    ? `${avgResponseMs} ms`
                    : "-"
              }
              description={isRunning ? "Pages per second" : "Avg page response time"}
              icon={<TrendingUp className="h-5 w-5" />}
              status={
                avgResponseMs == null
                  ? undefined
                  : avgResponseMs < 500
                    ? "good"
                    : avgResponseMs < 1000
                      ? "warning"
                      : "bad"
              }
            />
        </div>

        {/* Audit */}
        <div className="mt-6">
          <SEOAuditCard
            analysis={analysisStatus?.analysis}
            crawl={analysisStatus}
            starting={starting}
            onStart={handleStartAnalysis}
          />
        </div>

        {/* Main */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PerformanceCard gsc={gscStats?.topKeywords ?? []} />
          <SEOHealthCard
            score={dashboardStats.score}
            issueCount={dashboardStats.issues}
            issues={latestAudit?.issues ?? []}
          />
        </div>

        {/* Core Web Vitals */}
        <div className="mt-6">
          <CoreWebVitalsCard pagespeed={latestPagespeedData} />
        </div>

        {/* Lower */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <KeywordsCard keywords={gscStats?.topKeywords ?? []} />
          <RecentAuditsCard audits={audits ?? []} auditsLoading={auditsLoading}/>
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <QuickActions
            onRunAudit={handleStartAnalysis}
            onViewPlan={handleViewPlan}
            onGenerate={handleGenerate}
            disabled={starting || isRunning}
          />
        </div>

        {/* Workspace */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">
            Workspace
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team and workspace settings.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              to={routes.MembersRoute.to}
              className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Manage Members
            </Link>

            <button
              onClick={handleLeaveWorkspace}
              className="inline-flex items-center justify-center rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              Leave Workspace
            </button>

            
            {/*<button
              onClick={runGetStatus}
              className="inline-flex items-center justify-center rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              Run get status
            </button>*/}
          </div>
        </div>

      </main>
    </div>
  );
}