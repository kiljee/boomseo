import { useState, useEffect } from 'react';
import { FileText, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useAction, useQuery } from 'wasp/client/operations';
import {
  startArticleOptimization,
  getArticleOptimization,
} from 'wasp/client/operations';

export type ArticleWdfIdfTerm = {
  term: string;
  articleWeight: number;
  urlScore: number;
  competitorAverage: number;
  lowerBound: number;
  upperBound: number;
  difference: number;
  competitors: number;
};

interface ArticleEditorProps {
  text: string;
  onTextChange: (val: string) => void;
  targetKeyword?: string;
  wdfIdfTerms?: ArticleWdfIdfTerm[];
}

export function ArticleEditor({
  text,
  onTextChange,
  targetKeyword = '',
  wdfIdfTerms = [],
}: ArticleEditorProps) {
  const [activeOptimizationId, setActiveOptimizationId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startOptimization = useAction(startArticleOptimization);

  // Poll for optimization status every 1.5 seconds while active
  const { data: optimizationRecord } = useQuery(
    getArticleOptimization,
    { optimizationId: activeOptimizationId as string },
    {
      enabled: Boolean(activeOptimizationId),
      refetchInterval: (query: any) => {
        const status = query?.state?.data?.status;
        return status === 'COMPLETED' || status === 'FAILED' ? false : 1500;
      },
    }
  );

  const isOptimizing =
    isStarting ||
    optimizationRecord?.status === 'PENDING' ||
    optimizationRecord?.status === 'PROCESSING';

  // When job completes, write the optimized content into the editor
  useEffect(() => {
    if (optimizationRecord?.status === 'COMPLETED' && optimizationRecord.optimizedContent) {
      onTextChange(optimizationRecord.optimizedContent);
      setActiveOptimizationId(null);
    } else if (optimizationRecord?.status === 'FAILED') {
      setErrorMessage(optimizationRecord.error || 'Optimization failed. Please try again.');
      setActiveOptimizationId(null);
    }
  }, [optimizationRecord, onTextChange]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleOptimize = async () => {
    if (!text.trim() || isOptimizing) return;

    setIsStarting(true);
    setErrorMessage(null);

    try {
      const response = await startOptimization({
        targetKeyword: targetKeyword.trim() || 'General Article',
        originalContent: text.trim(),
        tone: 'Professional',
        model: 'gpt-4o-mini',
        keywords: wdfIdfTerms,
      });

      setActiveOptimizationId(response.optimizationId);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not trigger article optimization.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Compare & Optimize Your Content</h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Paste or draft your article to benchmark against competitor WDF-IDF distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {optimizationRecord?.status === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Applied AI Optimization
            </span>
          )}

          <button
            type="button"
            onClick={handleOptimize}
            disabled={!text.trim() || isOptimizing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:scale-[1.02] hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizing with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Optimize WDF*IDF
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="border-b border-destructive/20 bg-destructive/10 px-5 py-2.5 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="p-5">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your article here to calculate term density and trigger AI optimization..."
          aria-label="Article content"
          className="min-h-[300px] w-full resize-y rounded-xl border border-border bg-background p-4 text-sm leading-6 outline-hidden transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>{text.length.toLocaleString()} characters</span>
          <span>{wordCount.toLocaleString()} words</span>
        </div>
      </div>
    </section>
  );
}