import { useState } from "react";
import { useNavigate } from "react-router";
import { useAction } from "wasp/client/operations";
import { createOrganization } from "wasp/client/operations";
import { routes } from "wasp/client/router";

type WebsiteAnalysisStepProps = {
  websiteUrl: string;
  onContinue: () => void;
  onBack?: () => void;
};

export function WebsiteAnalysis({
  websiteUrl,
  onContinue,
  onBack,
}: WebsiteAnalysisStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  async function handleAnalyze() {
    setIsAnalyzing(true);

    // TODO: Replace this with your actual website crawl action.
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setIsAnalyzing(false);
    setHasAnalyzed(true);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
    
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Analyze your website
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            We’ll analyze your website to find SEO opportunities,
            keywords, technical issues, and content improvements.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {/* Website */}
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Website to analyze
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {websiteUrl}
            </p>
          </div>

          {!isAnalyzing && !hasAnalyzed && (
            <>
              <div className="mt-6">
                <h2 className="text-base font-semibold text-foreground">
                  Ready to analyze
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  We’ll crawl the website and look for SEO opportunities.
                  This may take a few moments.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                className="
                  mt-6 w-full rounded-xl
                  bg-primary px-4 py-3.5
                  text-sm font-semibold
                  text-primary-foreground
                  shadow-sm transition
                  hover:opacity-90
                "
              >
                Start Website Analysis
              </button>
            </>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <div className="py-10 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />

              <h2 className="mt-5 text-base font-semibold text-foreground">
                Analyzing your website...
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Crawling pages and looking for SEO opportunities.
              </p>

              <div className="mx-auto mt-6 max-w-sm space-y-2 text-left text-xs text-muted-foreground">
                <div>✓ Connecting to website</div>
                <div>✓ Discovering pages</div>
                <div>• Checking SEO signals...</div>
                <div>• Finding keywords and issues...</div>
              </div>
            </div>
          )}

          {/* Results preview */}
          {hasAnalyzed && !isAnalyzing && (
            <>
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-xs text-green-600 dark:text-green-400">
                    ✓
                  </span>

                  <h2 className="text-base font-semibold text-foreground">
                    Analysis complete
                  </h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  We found several areas where your website can improve.
                </p>
              </div>

              {/* Preview stats */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PreviewStat label="Pages" value="—" />
                <PreviewStat label="SEO Score" value="—" />
                <PreviewStat label="Keywords" value="—" />
                <PreviewStat label="Issues" value="—" />
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                These values will be populated by the website crawler once
                the backend analysis is connected.
              </p>

              <button
                type="button"
                onClick={onContinue}
                className="
                  mt-6 w-full rounded-xl
                  bg-primary px-4 py-3.5
                  text-sm font-semibold
                  text-primary-foreground
                  shadow-sm transition
                  hover:opacity-90
                "
              >
                Continue
              </button>
            </>
          )}
        </div>

        {/* Back */}
        {onBack && !isAnalyzing && (
          <button
            type="button"
            onClick={onBack}
            className="
              mx-auto mt-4 block
              text-sm text-muted-foreground
              transition hover:text-foreground
            "
          >
            ← Back
          </button>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can review the full analysis from your SEO dashboard later.
        </p>
      </div>
    
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
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}