const onboardingSteps = [
  {
    title: "Create your workspace",
    description:
      "Set up your workspace so we can analyze your website and generate your SEO strategy.",
  },
  {
    title: "Analyze your website",
    description:
      "We’ll analyze your website to find SEO opportunities, technical issues, and content improvements.",
  },
  {
    title: "Google Search Console",
    description:
      "Upload your Search Console data for better insights.",
  },
  {
    title: "SEO Context",
    description:
      "Tell us your goals so we generate the right content.",
  },
  {
    title: "Competitors",
    description:
      "Add competitor websites and we’ll find keyword and content gaps.",
  },
  {
    title: "Your SEO Plan",
    description:
      "We’ll combine your website, Search Console, and competitor data to build your SEO strategy.",
  },
];

export function OnboardingHeader({
  step,
}: {
  step: number;
}) {
  const current = onboardingSteps[step - 1];

  return (
    <>
      <div className="mb-8 flex items-center justify-center gap-2">
        {onboardingSteps.map((_, index) => {
          const number = index + 1;

          return (
            <div
              key={number}
              className="flex items-center gap-2"
            >
              <StepIndicator
                number={number}
                active={number === step}
                completed={number < step}
              />

              {number < onboardingSteps.length && (
                <StepLine />
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <p className="text-sm font-medium text-primary">
          Step {step} of {onboardingSteps.length}
        </p>

        {/*<h1 className="mt-2 text-3xl font-bold tracking-tight">
          {current.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {current.description}
        </p>*/}
      </div>
    </>
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