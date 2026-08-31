import { useQuery } from "wasp/client/operations";
import { Link, routes } from "wasp/client/router";
import { ArrowLeft, CheckCircle2, Lightbulb } from "lucide-react";
import { getSEOPlan } from "wasp/client/operations";

type SEOPlanData = {
  summary: string;
  keywordClusters: {
    name: string;
    keywords: string[];
    priority: string;
  }[];
  blogTopics: {
    title: string;
    primaryKeyword: string;
    priority: string;
  }[];
  opportunities: {
    title: string;
    description: string;
    priority: string;
  }[];
};

export function ViewSEOPlanPage() {
  const {
    data: plan,
    isLoading,
  } = useQuery(getSEOPlan) as {
  data: {
    data: SEOPlanData;
  } | null;
  isLoading: boolean;
};

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading SEO plan...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to={routes.DashboardRoute.to}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">
            No SEO plan yet
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Complete the SEO onboarding to generate your plan.
          </p>
        </div>
      </div>
    );
  }

  const data = plan.data as {
    summary: string;
    keywordClusters: {
      name: string;
      keywords: string[];
      priority: string;
    }[];
    blogTopics: {
      title: string;
      primaryKeyword: string;
      priority: string;
    }[];
    opportunities: {
      title: string;
      description: string;
      priority: string;
    }[];
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <Link
          to={routes.DashboardRoute.to}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight">
            SEO Plan
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your personalized SEO strategy and opportunities.
          </p>
        </div>

        {/* Summary */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">
            Strategy Overview
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {data.summary}
          </p>
        </section>

        {/* Keyword clusters */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">
            Keyword Clusters
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data.keywordClusters.map((cluster, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold">
                    {cluster.name}
                  </h3>

                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {cluster.priority}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {cluster.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-lg bg-muted px-2.5 py-1 text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blog topics */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Recommended Content
          </h2>

          <div className="mt-4 space-y-3">
            {data.blogTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-medium">
                      {topic.title}
                    </h3>

                    <span className="text-xs font-medium text-muted-foreground">
                      {topic.priority}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Primary keyword: {topic.primaryKeyword}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Opportunities */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            SEO Opportunities
          </h2>

          <div className="mt-4 space-y-3">
            {data.opportunities.map((opportunity, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {opportunity.title}
                      </h3>

                      <span className="text-xs font-medium text-muted-foreground">
                        {opportunity.priority}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {opportunity.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}