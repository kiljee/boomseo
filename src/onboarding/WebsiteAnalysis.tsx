import { useState } from "react";
import type { AnalysisProps } from "./types";

export function WebsiteAnalysis({
  websiteUrl,
  onContinue,
  onBack,
}: AnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  async function handleAnalyze() {
    setIsAnalyzing(true);

    // TODO: Replace with LibreCrawl action.
    await new Promise((resolve) =>
      setTimeout(resolve, 2500)
    );

    setIsAnalyzing(false);
    setHasAnalyzed(true);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <StepIndicator number={1} completed />
          <StepLine />
          <StepIndicator number={2} active />
          <StepLine />
          <StepIndicator number={3} />
          <StepLine />
          <StepIndicator number={4} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            Step 2 of 6
          </p>

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

          {/* Website */}
          <div className="border-b border-border p-6 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Website
            </p>

            <p className="mt-2 truncate text-base font-semibold text-foreground">
              {websiteUrl}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-7">

            {/* Initial state */}
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
                <div className="
                  mx-auto h-10 w-10
                  animate-spin rounded-full
                  border-2 border-muted
                  border-t-primary
                " />

                <h2 className="mt-5 text-lg font-semibold text-foreground">
                  Analyzing your website
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  This may take a few moments.
                </p>

                <div className="
                  mx-auto mt-6 max-w-sm
                  rounded-xl border border-border
                  bg-muted/30 p-4
                  text-left text-sm
                ">
                  <AnalysisProgressItem
                    text="Connecting to website"
                    completed
                  />

                  <AnalysisProgressItem
                    text="Discovering pages"
                    completed
                  />

                  <AnalysisProgressItem
                    text="Checking SEO signals"
                  />

                  <AnalysisProgressItem
                    text="Finding issues and opportunities"
                  />
                </div>
              </div>
            )}

            {/* Completed */}
            {hasAnalyzed && !isAnalyzing && (
              <div>
                <div className="flex items-center gap-3">
                  <div className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    bg-green-500/10
                    text-green-600
                    dark:text-green-400
                  ">
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

                {/* Results preview */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PreviewStat
                    label="Pages"
                    value="—"
                  />

                  <PreviewStat
                    label="SEO Score"
                    value="—"
                  />

                  <PreviewStat
                    label="Keywords"
                    value="—"
                  />

                  <PreviewStat
                    label="Issues"
                    value="—"
                  />
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Detailed results will be available
                  from the SEO dashboard.
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
  return (
    <div className="h-px w-6 bg-border" />
  );
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