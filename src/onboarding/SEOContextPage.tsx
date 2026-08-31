import { useState } from "react";
import { useAction } from "wasp/client/operations";
import { saveSEOContext } from "wasp/client/operations";
import { OnboardingHeader } from "./OnboardingHeader";

export function SEOContextPage({ onContinue, onBack }: any) {
  const saveContext = useAction(saveSEOContext);

  const [goal, setGoal] = useState("Increase organic traffic");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");

  async function handleContinue() {
    await saveContext({
      goal,
      audience,
      tone,
      language,
    });

    onContinue();
  }

  return (
    <div className="mx-auto max-w-2xl p-8">

      <OnboardingHeader step={4}/>

      <h1 className="text-2xl font-bold">
        SEO Context
      </h1>

      <p className="mt-2 text-muted-foreground">
        Tell us your goals so we generate the right content.
      </p>

      <div className="mt-8 space-y-5">

        <div>
          <label className="text-sm font-medium">
            Primary goal
          </label>

          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-2 w-full rounded-lg border bg-background p-2.5"
          >
            <option>Increase organic traffic</option>
            <option>Generate leads</option>
            <option>Increase sales</option>
            <option>Improve rankings</option>
            <option>Build brand visibility</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Target audience
          </label>

          <textarea
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Describe your ideal customers..."
            className="mt-2 min-h-28 w-full rounded-lg border bg-background p-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Content tone
          </label>

          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mt-2 w-full rounded-lg border bg-background p-2.5"
          >
            <option>Professional</option>
            <option>Friendly</option>
            <option>Authoritative</option>
            <option>Casual</option>
            <option>Technical</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Content language
          </label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 w-full rounded-lg border bg-background p-2.5"
          >
            <option>English</option>
            <option>Serbian</option>
            <option>German</option>
            <option>French</option>
            <option>Spanish</option>
          </select>
        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border px-4 py-2"
        >
          Back
        </button>

        <button
          onClick={handleContinue}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          Continue
        </button>
      </div>
    </div>
  );
}