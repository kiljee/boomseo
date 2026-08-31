import { useEffect, useState } from "react";
import { useAction } from "wasp/client/operations";
import { generateSEOPlan } from "wasp/client/operations";

export function SEOPlanPage({
  onContinue,
  onBack
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const generate = useAction(generateSEOPlan);

  const [status, setStatus] = useState<
    "generating" | "complete" | "error"
  >("generating");

  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    async function run() {
      try {
        const result = await generate({});

        setPlan(result);
        setStatus("complete");
      } catch (error) {
        console.error(
          "SEO plan generation failed:",
          error
        );

        setStatus("error");
      }
    }

    run();
  }, []);

  if (status === "generating") {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">
          Building your SEO plan
        </h1>

        <p className="mt-2 text-muted-foreground">
          We're analyzing your data and generating
          opportunities.
        </p>

        <div className="mt-10 space-y-4">
          <div>✓ Website analyzed</div>
          <div>✓ Search Console data processed</div>
          <div>✓ SEO context saved</div>
          <div>✓ Competitors processed</div>
          <div className="font-medium">
            ● Generating keyword clusters and content opportunities...
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">
          Couldn't generate your SEO plan
        </h1>

        <p className="mt-2 text-muted-foreground">
          Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">
        Your SEO Plan is Ready
      </h1>

      <p className="mt-2 text-muted-foreground">
        We've analyzed your website and generated
        your initial SEO strategy.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-2xl font-bold">
            {plan?.keywordClusters?.length ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Keyword clusters
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-2xl font-bold">
            {plan?.blogTopics?.length ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Blog topics
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-2xl font-bold">
            {plan?.opportunities?.length ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Opportunities
          </p>
        </div>
      </div>

      {plan?.summary && (
        <div className="mt-6 rounded-xl border p-5">
          <h2 className="font-semibold">
            Strategy
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {plan.summary}
          </p>
        </div>
      )}

      <button
        onClick={onContinue}
        className="mt-8 rounded-lg bg-primary px-5 py-2.5 text-primary-foreground"
      >
        Go to Dashboard
      </button>
    </div>
  );
}