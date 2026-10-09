import { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  FileText,
  Loader2,
  Search,
  TrendingDown,
  TrendingUp,
  XCircle,
  Monitor,
  Smartphone
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAction } from 'wasp/client/operations';
import { analyzeWdfIdfKeyword } from 'wasp/client/operations';
import { calculateArticleWdfIdf } from '../utils/wdfidf';

type SERPResult = {
  position: number;
  title: string;
  url: string;
  snippet: string;
};

type CompetitorPage = {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  text: string;
  wordCount: number;
};

type WdfIdfTerm = {
  term: string;
  idf: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  competitors: number;
};

type ArticleWdfIdfTerm = {
  term: string;
  articleWeight: number;
  competitorAverage: number;
  difference: number;
  competitors: number;
};

type AnalysisResult = {
  serpResults: SERPResult[];
  competitorPages: CompetitorPage[];
  wdfIdf: WdfIdfTerm[];
};

export function WdfIdfPage() {
  const analyzeKeyword = useAction(analyzeWdfIdfKeyword);

  const [keyword, setKeyword] = useState('');
  const [text, setText] = useState('');
  const [research, setResearch] =
    useState<AnalysisResult | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetUrl, setTargetUrl] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [targetState, setTargetState] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  /*
   * ------------------------------------------------------------------
   * Article analysis
   * ------------------------------------------------------------------
   */

  const articleAnalysis = useMemo<ArticleWdfIdfTerm[]>(() => {
    if (!research || !text.trim()) {
      return [];
    }

    return calculateArticleWdfIdf(
      text,
      research.wdfIdf ?? []
    );
  }, [text, research]);

  const underusedTerms = useMemo(() => {
    return [...articleAnalysis]
      .filter((term) => term.difference < 0)
      .sort((a, b) => a.difference - b.difference)
      .slice(0, 10);
  }, [articleAnalysis]);

  const overusedTerms = useMemo(() => {
    return [...articleAnalysis]
      .filter((term) => term.difference > 0)
      .sort((a, b) => b.difference - a.difference)
      .slice(0, 10);
  }, [articleAnalysis]);

  /*
   * ------------------------------------------------------------------
   * WDF-IDF chart
   * ------------------------------------------------------------------
   */

  const chartData = useMemo(() => {
    if (!research) {
      return [];
    }

    return [...research.wdfIdf]
      .sort(
        (a, b) =>
          b.averageScore - a.averageScore
      )
      .slice(0, 25)
      .map((term) => ({
        term: term.term,
        average: Number(
          term.averageScore.toFixed(5)
        ),
        maximum: Number(
          term.maxScore.toFixed(5)
        ),
        minimum: Number(
          term.minScore.toFixed(5)
        ),
        competitors: term.competitors,
      }));
  }, [research]);

  /*
   * ------------------------------------------------------------------
   * Analyze keyword
   * ------------------------------------------------------------------
   */

  const handleAnalyze = async () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResearch(null);
    setText('');

    try {
      const result = await analyzeKeyword({
        keyword: trimmedKeyword,
      });

      setResearch(result as AnalysisResult);
    } catch (err: any) {
      setError(
        err?.message ??
          'Failed to analyze search results.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /*
   * ------------------------------------------------------------------
   * Article comparison max value
   * ------------------------------------------------------------------
   */

  const maxScore = Math.max(
    ...articleAnalysis.map((term) =>
      Math.max(
        term.articleWeight,
        term.competitorAverage
      )
    ),
    0
  );

  /*
   * ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                WDF-IDF Analyzer
              </h1>

              <p className="text-sm text-muted-foreground">
                Analyze the terms used by pages ranking for
                your target keyword.
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================================
            KEYWORD SEARCH
        ========================================================== */}
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
    {/* Keyword + URL */}
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor="target-keyword" className="text-sm font-medium">
          Target keyword
        </label>

        <input
          id="target-keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. best SEO tools"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>

    {/* Country + State + Device */}
    <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr_auto]">
      <div className="space-y-1.5">
        <label htmlFor="target-country" className="text-sm font-medium">
          Target country
        </label>

        <input
          id="target-country"
          value={targetCountry}
          onChange={(e) => setTargetCountry(e.target.value)}
          placeholder="e.g. USA"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="target-state" className="text-sm font-medium">
          State / region
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </label>

        <input
          id="target-state"
          value={targetState}
          onChange={(e) => setTargetState(e.target.value)}
          placeholder="e.g. California"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          Device
        </label>

        <div className="flex h-10 gap-2">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
              device === "desktop"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </button>

          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
              device === "mobile"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </button>
        </div>
      </div>
    </div>

    {/* Analyze */}
    <div className="mt-5 flex justify-end">
      <button
        type="button"
        onClick={handleAnalyze}
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

        {/* ==========================================================
            ANALYSIS RESULTS
        ========================================================== */}

        {research && (
          <>
            {/* ======================================================
                SUMMARY
            ====================================================== */}

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Terms discovered
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {research.wdfIdf.length}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Terms found in the competitor corpus
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Competitor pages
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {research.competitorPages.length}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Pages included in the analysis
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Terms displayed
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {Math.min(
                    research.wdfIdf.length,
                    25
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Highest average WDF-IDF terms
                </p>
              </div>
            </div>

            {/* ======================================================
                WDF-IDF GRAPH
            ====================================================== */}

            <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />

                      <h2 className="font-medium">
                        WDF-IDF keyword analysis
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      WDF-IDF frequency of the most prominent
                      terms found across the ranking pages.
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium">
                    Top {chartData.length} terms
                  </div>
                </div>
              </div>

              <div className="p-5">
                {chartData.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No WDF-IDF terms were found.
                  </div>
                ) : (
                  <div className="h-[520px] w-full">
                    <div className="p-5">
  {chartData.length === 0 ? (
    <div className="py-12 text-center text-sm text-muted-foreground">
      No WDF-IDF terms were found.
    </div>
  ) : (
    <div className="h-[520px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 110,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-border"
            vertical={false}
          />

          <XAxis
            dataKey="term"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={120}
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              Number(value).toFixed(3)
            }
          />

          <Tooltip
            formatter={(value, name) => [
              typeof value === "number"
                ? value.toFixed(5)
                : "—",
              name,
            ]}
          />

          <Legend />

          <Bar
            dataKey="average"
            name="Average"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />

          <Line
            type="monotone"
            dataKey="average"
            name="Average line"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ r: 4 }}
          />

          <Bar
            dataKey="maximum"
            name="Maximum"
            fill="hsl(var(--muted-foreground) / 0.45)"
            radius={[4, 4, 0, 0]}
          />

          <Bar
            dataKey="minimum"
            name="Minimum"
            fill="hsl(var(--muted-foreground) / 0.2)"
            radius={[4, 4, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )}
</div>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================
                TERM STATISTICS
            ====================================================== */}

            <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <div>
                  <h2 className="font-medium">
                    Term statistics
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Detailed WDF-IDF statistics for the most
                    prominent terms.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 text-left font-medium">
                          Term
                        </th>

                        <th className="px-5 py-3 text-right font-medium">
                          Average
                        </th>

                        <th className="px-5 py-3 text-right font-medium">
                          Maximum
                        </th>

                        <th className="px-5 py-3 text-right font-medium">
                          Minimum
                        </th>

                        <th className="px-5 py-3 text-right font-medium">
                          Competitors
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {chartData.map((term) => (
                        <tr
                          key={term.term}
                          className="transition hover:bg-muted/30"
                        >
                          <td className="px-5 py-3 font-medium">
                            {term.term}
                          </td>

                          <td className="px-5 py-3 text-right text-muted-foreground">
                            {term.average.toFixed(5)}
                          </td>

                          <td className="px-5 py-3 text-right text-muted-foreground">
                            {term.maximum.toFixed(5)}
                          </td>

                          <td className="px-5 py-3 text-right text-muted-foreground">
                            {term.minimum.toFixed(5)}
                          </td>

                          <td className="px-5 py-3 text-right text-muted-foreground">
                            {term.competitors}/
                            {
                              research
                                .competitorPages
                                .length
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ======================================================
                COMPETITOR PAGES
            ====================================================== */}

            <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium">
                      Competitor pages
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Ranking pages used to build the
                      WDF-IDF corpus.
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium">
                    {
                      research.competitorPages
                        .length
                    }{' '}
                    pages
                  </div>
                </div>
              </div>

              {research.competitorPages.length ===
              0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No competitor pages could be analyzed.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {research.competitorPages.map(
                    (page, index) => (
                      <div
                        key={page.url}
                        className="flex items-center gap-4 p-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {page.title ||
                              page.url}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {page.url}
                          </p>
                        </div>

                        <div className="hidden text-xs text-muted-foreground sm:block">
                          {(
                            page.wordCount ?? 0
                          ).toLocaleString()}{' '}
                          words
                        </div>

                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* ======================================================
                YOUR CONTENT
            ====================================================== */}

            <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />

                  <h2 className="font-medium">
                    Compare your content
                  </h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Optionally paste your article to compare
                  its term usage against the competitor
                  corpus.
                </p>
              </div>

              <div className="p-5">
                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  placeholder="Paste your article here..."
                  className="min-h-[300px] w-full resize-y rounded-xl border border-border bg-background p-4 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {text.length.toLocaleString()}{' '}
                    characters
                  </span>

                  <span>
                    {text.trim()
                      ? text
                          .trim()
                          .split(/\s+/)
                          .length.toLocaleString()
                      : 0}{' '}
                    words
                  </span>
                </div>
              </div>
            </div>

            {/* ======================================================
                ARTICLE COMPARISON
            ====================================================== */}

            {text.trim() && (
              <>
                {/* --------------------------------------------------
                    Article summary
                -------------------------------------------------- */}

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                      Terms analyzed
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {articleAnalysis.length}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Terms compared with competitors
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                      Potentially underused
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {underusedTerms.length}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Below competitor average
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                      Potentially overused
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {overusedTerms.length}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Above competitor average
                    </p>
                  </div>
                </div>

                {/* --------------------------------------------------
                    Article comparison
                -------------------------------------------------- */}

                <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
                  <div className="border-b border-border p-5">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />

                      <h2 className="font-medium">
                        Your content vs. competitors
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Compare the WDF-IDF weight of your
                      terms against the competitor average.
                    </p>
                  </div>

                  <div className="p-5">
                    {articleAnalysis.length ===
                    0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No comparable terms found.
                      </p>
                    ) : (
                      <div className="space-y-5">
                        {articleAnalysis
                          .slice()
                          .sort(
                            (a, b) =>
                              Math.abs(
                                b.difference
                              ) -
                              Math.abs(
                                a.difference
                              )
                          )
                          .slice(0, 30)
                          .map((term) => {
                            const yourWidth =
                              maxScore > 0
                                ? (term.articleWeight /
                                    maxScore) *
                                  100
                                : 0;

                            const competitorWidth =
                              maxScore > 0
                                ? (term.competitorAverage /
                                    maxScore) *
                                  100
                                : 0;

                            const isUnderused =
                              term.difference <
                              0;

                            return (
                              <div
                                key={term.term}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {term.term}
                                    </span>

                                    {isUnderused ? (
                                      <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    ) : (
                                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                    )}
                                  </div>

                                  <span
                                    className={`text-xs font-medium ${
                                      isUnderused
                                        ? 'text-muted-foreground'
                                        : 'text-primary'
                                    }`}
                                  >
                                    {term.difference >=
                                    0
                                      ? '+'
                                      : ''}
                                    {term.difference.toFixed(
                                      5
                                    )}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-20 text-xs text-muted-foreground">
                                      Your text
                                    </span>

                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className="h-full rounded-full bg-primary"
                                        style={{
                                          width: `${yourWidth}%`,
                                        }}
                                      />
                                    </div>

                                    <span className="w-16 text-right text-xs text-muted-foreground">
                                      {term.articleWeight.toFixed(
                                        4
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="w-20 text-xs text-muted-foreground">
                                      Competitors
                                    </span>

                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className="h-full rounded-full bg-muted-foreground/50"
                                        style={{
                                          width: `${competitorWidth}%`,
                                        }}
                                      />
                                    </div>

                                    <span className="w-16 text-right text-xs text-muted-foreground">
                                      {term.competitorAverage.toFixed(
                                        4
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* --------------------------------------------------
                    Recommendations
                -------------------------------------------------- */}

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Underused */}

                  <div className="rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border p-5">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />

                        <h2 className="font-medium">
                          Potentially underused
                        </h2>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Terms whose WDF-IDF weight is below
                        the competitor average.
                      </p>
                    </div>

                    <div className="p-5">
                      {underusedTerms.length ===
                      0 ? (
                        <p className="text-sm text-muted-foreground">
                          No significantly underused
                          terms found.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {underusedTerms.map(
                            (term) => (
                              <div
                                key={term.term}
                                className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                              >
                                <span className="text-sm font-medium">
                                  {term.term}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                  {term.articleWeight.toFixed(
                                    4
                                  )}
                                  {' → '}
                                  {term.competitorAverage.toFixed(
                                    4
                                  )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overused */}

                  <div className="rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border p-5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />

                        <h2 className="font-medium">
                          Potentially overused
                        </h2>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Terms whose WDF-IDF weight is above
                        the competitor average.
                      </p>
                    </div>

                    <div className="p-5">
                      {overusedTerms.length ===
                      0 ? (
                        <p className="text-sm text-muted-foreground">
                          No significantly overused
                          terms found.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {overusedTerms.map(
                            (term) => (
                              <div
                                key={term.term}
                                className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                              >
                                <span className="text-sm font-medium">
                                  {term.term}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                  {term.articleWeight.toFixed(
                                    4
                                  )}
                                  {' → '}
                                  {term.competitorAverage.toFixed(
                                    4
                                  )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ==========================================================
            EMPTY STATE
        ========================================================== */}

        {!research && !isAnalyzing && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>

            <h2 className="mt-4 font-medium">
              Analyze a keyword
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Enter a target keyword above to find ranking
              pages and build a competitor WDF-IDF profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}