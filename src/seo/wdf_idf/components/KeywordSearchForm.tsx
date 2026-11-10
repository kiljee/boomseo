import { useState } from 'react';
import {
  Search,
  Loader2,
  Monitor,
  Smartphone,
  Globe,
} from 'lucide-react';
import { COUNTRY_GROUPS } from '../../utils/geoUtils';

export type SearchFormValues = {
  keyword: string;
  targetUrl: string;
  targetCountry: string;
  targetState: string;
  device: 'desktop' | 'mobile';
};

type KeywordSearchFormProps = {
  isAnalyzing: boolean;
  onAnalyze: (values: SearchFormValues) => void;
};

export function KeywordSearchForm({
  isAnalyzing,
  onAnalyze,
}: KeywordSearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [targetCountry, setTargetCountry] = useState('US');
  const [targetState, setTargetState] = useState('');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleSubmit = () => {
    const trimmed = keyword.trim();
    if (!trimmed || isAnalyzing) return;
    onAnalyze({
      keyword: trimmed,
      targetUrl: targetUrl.trim(),
      targetCountry: targetCountry.trim() || 'US',
      targetState: targetState.trim(),
      device,
    });
  };

  const inputClass =
    'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Target keyword</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Search the SERP to build a WDF-IDF profile from competing pages.
        </p>
      </div>

      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="target-keyword" className="text-sm font-medium">
              Target keyword
            </label>

            <input
              id="target-keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              placeholder="e.g. best SEO tools"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="target-url" className="text-sm font-medium">
              Target URL
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>

            <input
              id="target-url"
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/page"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[240px_1fr_auto]">
          <div className="space-y-1.5">
            <label
              htmlFor="target-country"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              Target country
            </label>

            <select
              id="target-country"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {COUNTRY_GROUPS.map((section) => (
                <optgroup key={section.group} label={section.group}>
                  {section.countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="target-state" className="text-sm font-medium">
              City / State
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>

            <input
              id="target-state"
              value={targetState}
              onChange={(e) => setTargetState(e.target.value)}
              placeholder="e.g. Beograd, Berlin, or California"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Device</label>

            <div className="flex h-10 gap-2">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                aria-pressed={device === 'desktop'}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                  device === 'desktop'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Monitor className="h-4 w-4" />
                Desktop
              </button>

              <button
                type="button"
                onClick={() => setDevice('mobile')}
                aria-pressed={device === 'mobile'}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                  device === 'mobile'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                Mobile
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isAnalyzing || !keyword.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}