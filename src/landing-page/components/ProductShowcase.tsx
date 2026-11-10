import {
  ArrowRight,
  FileText,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Research your keyword",
    description:
      "Explore search results for your target keyword and identify relevant competing pages to analyze.",
  },
  {
    number: "02",
    icon: Target,
    title: "Understand the competition",
    description:
      "Analyze competitor content and discover the terms, topics, and content patterns that distinguish relevant pages.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Improve your article",
    description:
      "Compare your draft using WDF-IDF analysis, identify content gaps, and use AI assistance to improve your article.",
  },
];

const recommendations = [
  {
    term: "residential construction",
    status: "Underused",
    style: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    term: "construction company",
    status: "Missing",
    style: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    term: "building materials",
    status: "Balanced",
    style: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
];

export function ProductShowcase() {
  return (
    <>
      <section id="workflow" className="border-y border-border bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From keyword research to better content
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              BoomSEO connects competitor research, content analysis, and
              AI-assisted optimization into one practical workflow.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold tracking-widest text-muted-foreground/60">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="content-optimization"
        className="overflow-hidden py-24 sm:py-32"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Content optimization
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Go beyond keywords. Understand content relevance.
            </h2>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Knowing your target keyword is only the starting point. BoomSEO
              helps you compare your article with competing content and
              understand which relevant terms may be missing or underused.
            </p>

            <div className="mt-8 space-y-5">
              <Benefit
                title="Compare against competitor content"
                description="Use competitor pages as a reference when evaluating your article."
              />
              <Benefit
                title="Find content gaps"
                description="Identify missing, underused, and overused terms through WDF-IDF analysis."
              />
              <Benefit
                title="Optimize with AI assistance"
                description="Turn analysis results into focused recommendations for improving your draft."
              />
            </div>
          </div>

          {/* Illustrative WDF-IDF interface */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Article analysis</h3>
                  <p className="text-xs text-muted-foreground">
                    Example WDF-IDF results
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Content insights
              </span>
            </div>

            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Term coverage</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Comparison with competitor content
                  </p>
                </div>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-5 space-y-3">
                {recommendations.map((item) => (
                  <div
                    key={item.term}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-4"
                  >
                    <span className="text-sm font-medium">{item.term}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${item.style}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Optimization opportunity</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Review underused and missing terms, then incorporate relevant
                concepts naturally where they fit your article.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-primary">
                AI-assisted content improvement
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Illustrative results, not live analysis data.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Benefit({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}