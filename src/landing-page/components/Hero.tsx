import { ArrowRight, CheckCircle2, FileText, Search, Sparkles, Globe } from "lucide-react";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../../client/components/ui/button";

const previewTerms = [
  { term: "residential construction", status: "Underused" },
  { term: "construction company", status: "Missing" },
  { term: "building materials", status: "Balanced" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-20 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden blur-3xl"
      >
        <div className="h-96 w-[48rem] rounded-full bg-primary/10 opacity-70" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            SEO research and content optimization
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Create better SEO content with{" "}
            <span className="text-gradient-primary">competitor insights.</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Research keywords, analyze competing pages, and improve your
            articles with WDF-IDF insights and AI-assisted optimization.
            Everything you need to make more informed SEO content decisions
            in one workspace.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Button size="lg" asChild>
              <WaspRouterLink
                to={routes.DashboardRoute.to}
                className="inline-flex items-center gap-2"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </WaspRouterLink>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <a href="#workflow">Explore how it works</a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Competitor research
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              WDF-IDF analysis
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              AI content assistance
            </span>
          </div>
        </div>

        {/* Illustrative product preview */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Content research</p>
                  <p className="text-xs text-muted-foreground">
                    Illustrative analysis
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                Analysis ready
              </span>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Target keyword
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    best residential contractors
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs">Competitor research</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold">SERP insights</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explore competing pages
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">Content analysis</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold">WDF-IDF</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Compare term coverage
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">Term recommendations</p>
                  <span className="text-xs text-muted-foreground">
                    Example results
                  </span>
                </div>

                <div className="space-y-2">
                  {previewTerms.map((item) => (
                    <div
                      key={item.term}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3"
                    >
                      <span className="text-sm">{item.term}</span>
                      <TermStatus status={item.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Turn insights into improvements
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use AI assistance to improve your article based on relevant
                    content recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Example interface for illustration purposes.
          </p>
        </div>
      </div>
    </section>
  );
}

function TermStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Missing: "bg-red-500/10 text-red-600 dark:text-red-400",
    Underused: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Balanced: "bg-green-500/10 text-green-600 dark:text-green-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function GlobeIcon() {
  return <Search className="h-4 w-4" />;
}