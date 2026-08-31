import { useEffect, useState } from "react";
import { useAction, useQuery } from "wasp/client/operations";
import {
  startSEOAnalysis,
  getSEOAnalysisStatus,
} from "wasp/client/operations";
import type { AnalysisProps } from "./types";
import { OnboardingHeader } from "./OnboardingHeader";

export function WebsiteAnalysis({
  onContinue,
  onBack,
}: AnalysisProps) {
  const startAnalysis = useAction(startSEOAnalysis);

  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Start the actual backend analysis.
   */
  async function handleAnalyze() {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await startAnalysis({});
      setAnalysisId(result.analysisId);
    } catch (err) {
      console.error("Failed to start SEO analysis:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to start website analysis."
      );

      setIsAnalyzing(false);
    }
  }

  /*
   * Poll the backend reactively until the analysis is complete.
   */
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

  useEffect(() => {
    if (
      analysisStatus?.completed ||
      analysisStatus?.analysis?.status === "COMPLETED"
    ) {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    } else if (analysisStatus?.analysis?.status === "FAILED") {
      setIsAnalyzing(false);
      setError("Failed while analyzing the website.");
    }
  }, [analysisStatus?.completed, analysisStatus?.analysis?.status]);

  const crawl = analysisStatus?.crawl;

  const pages =
    analysisStatus?.crawled ??
    crawl?.stats?.crawled ??
    analysisStatus?.analysis?.pagesCrawled ??
    0;

  const issues =
    (Array.isArray(analysisStatus?.issues)
      ? analysisStatus.issues.length
      : analysisStatus?.issues) ??
    analysisStatus?.analysis?.issueCount ??
    0;

  const seoScore =
    analysisStatus?.analysis?.seoScore ?? null;

  const progress =
    analysisStatus?.progress ??
    crawl?.progress ??
    0;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">

        {/* Step indicator */}
        <OnboardingHeader step={2}/>

        {/* Header */}
        <div className="mb-8">

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Analyze your website
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We’ll analyze your website to find SEO opportunities,
            technical issues, and content improvements.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">

          {/* Content */}
          <div className="p-6 sm:p-7">

            {/* Initial */}
            {!isAnalyzing && !hasAnalyzed && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Ready to analyze
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We’ll crawl your website and check its pages,
                  metadata, links, content, and other important
                  SEO signals.
                </p>

                {error && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="
                    mt-6 w-full rounded-xl
                    bg-primary px-4 py-3
                    text-sm font-semibold
                    text-primary-foreground
                    transition hover:opacity-90
                  "
                >
                  Start Analysis
                </button>
              </div>
            )}

            {/* Loading */}
            {isAnalyzing && (
              <div className="py-6 text-center">
                <div
                  className="
                    mx-auto h-10 w-10
                    animate-spin rounded-full
                    border-2 border-muted
                    border-t-primary
                  "
                />

                <h2 className="mt-5 text-lg font-semibold text-foreground">
                  Analyzing your website
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {progress > 0
                    ? `${Math.round(progress)}% complete`
                    : "This may take a few moments."}
                </p>

                {/* Progress bar */}
                <div className="mx-auto mt-5 max-w-sm">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, progress)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div
                  className="
                    mx-auto mt-6 max-w-sm
                    rounded-xl border border-border
                    bg-muted/30 p-4
                    text-left text-sm
                  "
                >
                  <AnalysisProgressItem
                    text="Connecting to website"
                    completed
                  />

                  <AnalysisProgressItem
                    text="Discovering pages"
                    completed={
                      pages > 0
                    }
                  />

                  <AnalysisProgressItem
                    text="Checking SEO signals"
                    completed={
                      pages > 0
                    }
                  />

                  <AnalysisProgressItem
                    text="Finding issues and opportunities"
                    completed={false}
                  />
                </div>

                {error && (
                  <p className="mt-4 text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* Completed */}
            {hasAnalyzed && !isAnalyzing && (
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-full
                      bg-green-500/10
                      text-green-600
                      dark:text-green-400
                    "
                  >
                    ✓
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Analysis complete
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Your website has been analyzed successfully.
                    </p>
                  </div>
                </div>

                {/* Actual results */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <PreviewStat
                    label="Pages"
                    value={String(pages)}
                  />

                  <PreviewStat
                    label="SEO Score"
                    value={
                      seoScore != null
                        ? String(seoScore)
                        : "—"
                    }
                  />

                  <PreviewStat
                    label="Issues"
                    value={String(issues)}
                  />
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Detailed results will be available from the
                  SEO dashboard.
                </p>

                <button
                  type="button"
                  onClick={onContinue}
                  className="
                    mt-6 w-full rounded-xl
                    bg-primary px-4 py-3
                    text-sm font-semibold
                    text-primary-foreground
                    transition hover:opacity-90
                  "
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {!isAnalyzing && (
          <div className="mt-5 flex justify-start">
            <button
              type="button"
              onClick={onBack}
              className="
                text-sm text-muted-foreground
                transition hover:text-foreground
              "
            >
              ← Back
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          You can review and rerun your analysis from the dashboard later.
        </p>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  active = false,
  completed = false,
}: {
  number: number;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div
      className={`
        flex h-7 w-7 items-center justify-center
        rounded-full text-xs font-semibold
        ${
          active
            ? "bg-primary text-primary-foreground"
            : completed
            ? "bg-primary/10 text-primary"
            : "border border-border text-muted-foreground"
        }
      `}
    >
      {completed ? "✓" : number}
    </div>
  );
}

function StepLine() {
  return <div className="h-px w-6 bg-border" />;
}

function AnalysisProgressItem({
  text,
  completed = false,
}: {
  text: string;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span
        className={
          completed
            ? "text-green-600 dark:text-green-400"
            : "text-muted-foreground"
        }
      >
        {completed ? "✓" : "•"}
      </span>

      <span className="text-muted-foreground">
        {text}
      </span>
    </div>
  );
}

function PreviewStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}