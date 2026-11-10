import { useMemo, useState, useEffect } from 'react';

import {
  BarChart3,
  Search,
  Loader2,
  FileText,
  TableProperties,
  Sparkles,
} from 'lucide-react';

import { useAction, useQuery } from 'wasp/client/operations';

import {
  startWdfIdfAnalysis,
  getWdfIdfAnalysis,
} from 'wasp/client/operations';

import {
  KeywordSearchForm,
  type SearchFormValues,
} from './components/KeywordSearchForm';

import { AnalysisSummary } from './components/AnalysisSummary';
import { WdfIdfChart } from './components/WdfIdfChart';
import { TermStatisticsTable } from './components/TermStatisticsTable';
import { CompetitorPagesList } from './components/CompetitorPagesList';
import { ArticleEditor } from './components/ArticleEditor';
import { ArticleComparison } from './components/ArticleComparison';
import { ContentGapAnalysis } from './components/ContentGapAnalysis';
import { ViewToggle } from './components/ViewToggle';
import { TermBubbleView } from './components/TermBubbleView';
import { ArticleTermTable } from './components/ArticleTermTable';
import { TopTermsDialog } from './components/TopTermsDialog';

import { useArticleAnalysis } from './hooks/useArticleAnalysis';

import type { AnalysisResult, ChartTerm } from './types';

type AnalysisTab = 'competitors' | 'content' | 'statistics';

type ChartOrientation = 'vertical' | 'horizontal';

type TextDisplay = 'bubbles' | 'table' | 'chart';

const STORAGE_KEY = 'wdf-idf-last-analysis';

export function WdfIdfPage() {
  const triggerAnalysis = useAction(startWdfIdfAnalysis);

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [text, setText] = useState('');

  const [activeAnalysisId, setActiveAnalysisId] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<AnalysisTab>('competitors');

  const [chartOrientation, setChartOrientation] =
    useState<ChartOrientation>('vertical');

  const [textDisplay, setTextDisplay] =
    useState<TextDisplay>('bubbles');

  const [isTopTermsOpen, setIsTopTermsOpen] =
    useState(false);

  const [isOptimizing, setIsOptimizing] = useState(false);

  // --------------------------------------------------
  // Background job polling
  // --------------------------------------------------

  const isQueryEnabled = Boolean(activeAnalysisId);

  const {
    data: analysisRecord,
    error: queryError,
  } = useQuery(
    getWdfIdfAnalysis,
    {
      analysisId: activeAnalysisId as string,
    },
    {
      enabled: isQueryEnabled,
      refetchInterval: (query: any) => {
        const status = query?.state?.data?.status;

        return status === 'COMPLETED' || status === 'FAILED'
          ? false
          : 2000;
      },
    },
  );

  const isAnalyzing =
    isSubmitting ||
    analysisRecord?.status === 'PENDING' ||
    analysisRecord?.status === 'RUNNING';

  const isFailed =
    analysisRecord?.status === 'FAILED';

  const errorMessage =
    submitError ||
    (queryError
      ? (queryError as Error).message
      : null) ||
    (isFailed
      ? 'The background analysis task failed. Please try again.'
      : null);

  // --------------------------------------------------
  // Restore previous analysis
  // --------------------------------------------------

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setActiveAnalysisId(saved);
    }
  }, []);

  // --------------------------------------------------
  // Save completed analysis
  // --------------------------------------------------

  useEffect(() => {
    if (
      analysisRecord?.status === 'COMPLETED' &&
      activeAnalysisId
    ) {
      localStorage.setItem(
        STORAGE_KEY,
        activeAnalysisId,
      );
    }
  }, [analysisRecord, activeAnalysisId]);

  // --------------------------------------------------
  // Format analysis results
  // --------------------------------------------------

  const research = useMemo<AnalysisResult | null>(() => {
    if (
      analysisRecord?.status !== 'COMPLETED' ||
      !analysisRecord.wdfIdfAnalysis
    ) {
      return null;
    }

    return {
      serpResults: analysisRecord.serpResults ?? [],
      competitorPages:
        analysisRecord.competitorPages ?? [],
      wdfIdf: analysisRecord.wdfIdfAnalysis ?? [],
    };
  }, [analysisRecord]);

  // --------------------------------------------------
  // Article analysis
  // --------------------------------------------------

  const {
    articleAnalysis,
    underusedTerms,
    overusedTerms,
    maxScore,
  } = useArticleAnalysis(text, research);


  // --------------------------------------------------
  // Chart data
  // --------------------------------------------------

  const allChartData = useMemo<ChartTerm[]>(() => {
    if (!research) {
      return [];
    }

    return [...research.wdfIdf]
      .sort(
        (a, b) =>
          b.averageScore - a.averageScore,
      )
      .map((term) => ({
        term: term.term,

        averageTotal: Number(
          term.averageScore.toFixed(5),
        ),

        averageUsed: Number(
          (term.averageUsed ?? 0).toFixed(5),
        ),

        maximum: Number(
          term.maxScore.toFixed(5),
        ),

        minimum: Number(
          term.minScore.toFixed(5),
        ),

        competitors: term.competitors,

        suggestedFrequency: Number(
          (term.averageScore * 1.2).toFixed(5),
        ),

        urlScore: Number(
          (
            articleAnalysis?.find(
              (item) => item.term === term.term,
            )?.articleWeight ?? 0
          ).toFixed(5),
        ),
      }));
  }, [research, articleAnalysis]);

  // Chart uses a limited set of terms to keep it readable.
  // The statistics table uses the complete dataset.
  const chartData = useMemo(
    () => allChartData.slice(0, 100),
    [allChartData],
  );

  // --------------------------------------------------
  // Start analysis (FORWARD COMPLETE PAYLOAD)
  // --------------------------------------------------

  const handleAnalyze = async (
    values: SearchFormValues,
  ) => {
    if (isAnalyzing) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    setText('');
    setActiveAnalysisId(null);

    setActiveTab('competitors');
    setChartOrientation('vertical');
    setTextDisplay('bubbles');
    setIsTopTermsOpen(false);

    try {
      // FIX: Forward country, state/city, device, and targetUrl
      const response = await triggerAnalysis({
        keyword: values.keyword,
        targetUrl: values.targetUrl || undefined,
        targetCountry: values.targetCountry || 'US',
        targetState: values.targetState || undefined,
        device: values.device,
      });

      setActiveAnalysisId(response.analysisId);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Failed to start background analysis.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pt-8">

      {/* Page header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              WDF-IDF Analyzer
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Analyze ranking pages and discover terms relevant to your target keyword.
            </p>
          </div>
        </div>

        {/* Trigger for TopTermsDialog when research exists */}
        {research && (
          <button
            type="button"
            onClick={() => setIsTopTermsOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-xs transition hover:bg-accent"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Explore Common Terms</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {allChartData.length}
            </span>
          </button>
        )}
      </div>

      {/* Keyword search */}

      <KeywordSearchForm
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
      />

      {/* Error */}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      {/* Loading state */}

      {isAnalyzing && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center"
          role="status"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <h2 className="mt-4 font-medium">
            {analysisRecord?.status === 'RUNNING'
              ? 'Analyzing search results'
              : 'Queuing background job'}
          </h2>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {analysisRecord?.status === 'RUNNING'
              ? 'Crawling competitor pages and calculating WDF-IDF scores...'
              : 'Submitting your keyword analysis to the background worker...'}
          </p>
        </div>
      )}

      {/* Analysis results */}

      {research && (
        <>

          {/* Summary cards */}

          <AnalysisSummary
            research={research}
            displayedTerms={allChartData.length}
          />

          {/* Workspace tabs */}

          <div className="space-y-6">

            <div className="border-b border-border">
              <div
                role="tablist"
                aria-label="Analysis workspace"
                className="flex flex-wrap gap-2"
              >

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'competitors'}
                  onClick={() =>
                    setActiveTab('competitors')
                  }
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'competitors'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Competitor Analysis
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'content'}
                  onClick={() =>
                    setActiveTab('content')
                  }
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'content'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Content Optimization
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'statistics'}
                  onClick={() =>
                    setActiveTab('statistics')
                  }
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'statistics'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TableProperties className="h-4 w-4" />
                  Term Statistics

                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {allChartData.length}
                  </span>
                </button>

              </div>
            </div>

            {/* ------------------------------------------ */}
            {/* Competitor Analysis */}
            {/* ------------------------------------------ */}

            {activeTab === 'competitors' && (
              <section
                role="tabpanel"
                className="space-y-6"
              >

                {/* Competitor graph */}

                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">

                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h2 className="text-lg font-semibold">
                        Competitor term analysis
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Compare average WDF-IDF scores and the range found across ranking pages.
                      </p>
                    </div>

                    <ViewToggle
                      ariaLabel="Choose chart orientation"
                      value={chartOrientation}
                      onChange={setChartOrientation}
                      options={[
                        {
                          value: 'vertical',
                          label: 'Vertical bars',
                        },
                        {
                          value: 'horizontal',
                          label: 'Horizontal bars',
                        },
                      ]}
                    />

                  </div>

                  <WdfIdfChart
                    data={chartData}
                    orientation={chartOrientation}
                  />

                </div>

                {/* Competitor search results */}

                <CompetitorPagesList
                  pages={research.competitorPages}
                />

              </section>
            )}

            {/* ------------------------------------------ */}
            {/* Content Optimization */}
            {/* ------------------------------------------ */}

            {activeTab === 'content' && (
              <section className="space-y-6">

                {/* Article editor */}

                <ArticleEditor
                  text={text}
                  onTextChange={setText}
                  targetKeyword={
                    analysisRecord?.keyword?.keyword ||
                    (analysisRecord as any)?.targetKeyword ||
                    'Target Keyword'
                  }
                  wdfIdfTerms={articleAnalysis as any}
                />


                {!text.trim() ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Search className="h-6 w-6 text-primary" />
                    </div>

                    <h3 className="mt-4 font-medium">
                      Paste your content to get started
                    </h3>

                    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                      Your text will be compared with the terms discovered during competitor analysis.
                    </p>

                  </div>
                ) : (
                  <>

                    {/* Article summary */}

                    <div className="grid gap-4 sm:grid-cols-3">

                      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                          Terms analyzed
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                          {articleAnalysis.length}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Terms compared with competitor results
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                          Potentially underused
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-amber-600">
                          {underusedTerms.length}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Below competitor comparison values
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                          Potentially overused
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-rose-600">
                          {overusedTerms.length}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Above competitor comparison values
                        </p>
                      </div>

                    </div>

                    {/* Article visualization */}

                    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">

                      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                          <h2 className="text-lg font-semibold">
                            Your content analysis
                          </h2>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Explore how your terms compare with the competitor profile.
                          </p>
                        </div>

                        <ViewToggle
                          ariaLabel="Choose content comparison display"
                          value={textDisplay}
                          onChange={setTextDisplay}
                          options={[
                            {
                              value: 'bubbles',
                              label: 'Bubbles',
                            },
                            {
                              value: 'table',
                              label: 'Table',
                            },
                            {
                              value: 'chart',
                              label: 'Chart',
                            },
                          ]}
                        />

                      </div>

                      {textDisplay === 'bubbles' && (
                        <TermBubbleView
                          terms={articleAnalysis}
                          underusedTerms={underusedTerms}
                          overusedTerms={overusedTerms}
                        />
                      )}

                      {textDisplay === 'table' && (
                        <ArticleTermTable
                          terms={articleAnalysis}
                          underusedTerms={underusedTerms}
                          overusedTerms={overusedTerms}
                        />
                      )}

                      {textDisplay === 'chart' && (
                        <ArticleComparison
                          terms={articleAnalysis}
                          maxScore={maxScore}
                        />
                      )}

                    </div>

                    {/* Content gap analysis */}

                    <ContentGapAnalysis
                      underusedTerms={underusedTerms}
                      overusedTerms={overusedTerms}
                    />

                  </>
                )}

              </section>
            )}

            {/* ------------------------------------------ */}
            {/* Term Statistics */}
            {/* ------------------------------------------ */}

            {activeTab === 'statistics' && (
              <section
                role="tabpanel"
                className="space-y-6"
              >

                <div>
                  <h2 className="text-lg font-semibold">
                    Term statistics
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Explore the complete set of terms discovered during competitor analysis.
                  </p>
                </div>

                <TermStatisticsTable
                  data={allChartData}
                  totalCompetitors={
                    research.competitorPages.length
                  }
                />

              </section>
            )}

          </div>

        </>
      )}

      {/* Initial empty state */}

      {!research &&
        !isAnalyzing &&
        !errorMessage && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>

            <h2 className="mt-4 font-medium">
              Analyze a keyword
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Enter a target keyword above to find ranking pages and build a competitor WDF-IDF profile.
            </p>

          </div>
        )}

      {/* Top terms dialog */}

      <TopTermsDialog
        open={isTopTermsOpen}
        onClose={() =>
          setIsTopTermsOpen(false)
        }
        terms={allChartData}
      />

    </div>
  );
}