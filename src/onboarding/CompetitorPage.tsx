import { useState } from "react";
import { useAction } from "wasp/client/operations";
import { saveCompetitors } from "wasp/client/operations";
import { OnboardingHeader } from "./OnboardingHeader";

export function CompetitorPage({
  onContinue,
  onBack,
}: any) {
  const save = useAction(saveCompetitors);

  const [urls, setUrls] = useState<string[]>([""]);

  function updateUrl(index: number, value: string) {
    setUrls((current) =>
      current.map((url, i) =>
        i === index ? value : url
      )
    );
  }

  function addUrl() {
    if (urls.length < 5) {
      setUrls([...urls, ""]);
    }
  }

  function removeUrl(index: number) {
    setUrls(
      urls.filter((_, i) => i !== index)
    );
  }

  async function handleContinue() {
    await save({
      urls: urls.filter(Boolean),
    });

    onContinue();
  }

  return (

    <div className="mx-auto max-w-2xl p-8">

      <OnboardingHeader step={5}/>

      <h1 className="text-2xl font-bold">
        Competitors
      </h1>

      <p className="mt-2 text-muted-foreground">
        We'll find keyword and content gaps.
      </p>

      <div className="mt-8 space-y-3">
        {urls.map((url, index) => (
          <div
            key={index}
            className="flex gap-2"
          >
            <input
              value={url}
              onChange={(e) =>
                updateUrl(index, e.target.value)
              }
              placeholder="https://competitor.com"
              className="flex-1 rounded-lg border bg-background p-2.5"
            />

            {urls.length > 1 && (
              <button
                onClick={() => removeUrl(index)}
                className="rounded-lg border px-3"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {urls.length < 5 && (
          <button
            onClick={addUrl}
            className="text-sm text-primary hover:underline"
          >
            + Add competitor
          </button>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border px-4 py-2"
        >
          Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              await save({ urls: [] });
              onContinue();
            }}
            className="rounded-lg border px-4 py-2"
          >
            Skip
          </button>

          <button
            onClick={handleContinue}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}