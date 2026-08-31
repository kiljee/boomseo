import { useEffect, useState } from "react";
import { Link, routes } from "wasp/client/router";
import { useAction, useQuery } from "wasp/client/operations";
import {
  getCurrentOrganization,
  leaveOrganization,
  startSEOAnalysis,
  getSEOAnalysisStatus,
  syncSEOAnalysis,
  getLatestSEOAudit,
  getCrawlStatusQuery,
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
import { getGSCStats } from "wasp/client/operations";

import {
  Activity,
  BarChart3,
  Globe,
  Search,
  TrendingUp,
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

  /*const {
    data: CRAWLSTATUS,
    isLoading: crawlstatus_loading,
    refetch: refetchCrawlStatus
  } = useQuery(getCrawlStatusQuery);*/



  const [analysisStatus, setAnalysisStatus] = useState<any>(null);

  const syncAnalysis = useAction(syncSEOAnalysis);

  useEffect(() => {
    if(!analysisId) return;

    let canceled = false;

    async function poll() {
      while(!canceled) {
        try {
          const result = await syncAnalysis({
            analysisId : analysisId!,
          });

          if(canceled) {
           setStarting(false);  
           return;
          }
          setAnalysisStatus(result);

          if (result.completed) {
            await refetchLatestAudit();
            await refetchAudits();

            setStarting(false);
            return;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 1500)
          );

        } catch(error) {
          console.error("SEO analysis polling failed: ",error);
          break;
        }
      }

      setStarting(false);
    }

    poll();

    return () => {
      canceled = true;
    };
  }, [analysisId]);

  // Stop polling once LibreCrawl finishes.
  /*useEffect(() => {
    if (
      analysisStatus?.crawl?.status === "completed" ||
      analysisStatus?.analysis?.status === "COMPLETED" ||
      analysisStatus?.analysis?.status === "FAILED"
    ) {
      // React Query will stop polling because we can simply
      // leave the result displayed.
    }
  }, [analysisStatus]);*/

  async function handleStartAnalysis() {
    if (starting) return;

    setStarting(true);

    try {
      const result = await startAnalysis({});
      setAnalysisId(result.analysisId);
    } catch (error) {
      console.error("Failed to start SEO analysis:", error);
    } finally {
      
    }
  }

  async function handleViewPlan() {
    navigate(routes.ViewSEOPlanRoute.to);
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

  const score = dashboardStats.score;

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
          />

          <MetricCard
            title="Crawl Speed"
            value={
              dashboardStats.speed != null
                ? dashboardStats.speed.toFixed(1)
                : "-"
            }
            description="Pages per second"
            icon={<TrendingUp className="h-5 w-5" />}
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