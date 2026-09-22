import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Hash,
  Target,
  TrendingUp,
} from 'lucide-react';

type SEOOverviewProps = {
  article: any;
  content: string;
  wordCount: number;
};

type ContentBrief = {
  topics?: string[];
  recommendedTerms?: string[];
};

type WdfIdfTerm = {
  term: string;
  articleWeight?: number;
  competitorAverage?: number;
};

type WdfIdfAnalysis = {
  terms?: WdfIdfTerm[];
};

export function SEOOverview({
  article,
  content,
  wordCount,
}: SEOOverviewProps) {
  const contentBrief = (article?.contentBrief ?? {}) as ContentBrief;
  const wdfIdfAnalysis = (article?.wdfIdfAnalysis ?? {}) as WdfIdfAnalysis;

  const recommendedTerms = contentBrief.recommendedTerms ?? [];
  const topics = contentBrief.topics ?? [];
  const wdfIdfTerms = wdfIdfAnalysis.terms ?? [];

  const normalizedContent = content.toLowerCase();

  const usedKeywords = recommendedTerms.filter((term) =>
    normalizedContent.includes(term.toLowerCase())
  );

  const missingKeywords = recommendedTerms.filter(
    (term) => !normalizedContent.includes(term.toLowerCase())
  );

  const coveredTopics = topics.filter((topic) =>
    normalizedContent.includes(topic.toLowerCase())
  );

  const missingTopics = topics.filter(
    (topic) => !normalizedContent.includes(topic.toLowerCase())
  );

  /*
   * Temporary visual score.
   * Replace this with article.seoScore once the backend
   * calculates the actual SEO score.
   */
  const seoScore = calculateSEOScore({
    article,
    wordCount,
    usedKeywords: usedKeywords.length,
    totalKeywords: recommendedTerms.length,
    coveredTopics: coveredTopics.length,
    totalTopics: topics.length,
  });

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              SEO score
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Overall content optimization
            </p>
          </div>

          <span className="text-2xl font-bold text-foreground">
            {seoScore}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </section>

      {/* Keywords */}
      <section className="border-t border-border pt-5">
        <SectionHeader
          icon={Hash}
          title="Keywords"
          description={`${usedKeywords.length} of ${recommendedTerms.length} used`}
        />

        {recommendedTerms.length === 0 ? (
          <EmptyState text="No recommended keywords available." />
        ) : (
          <div className="mt-3 space-y-2">
            {usedKeywords.map((term) => (
              <KeywordRow
                key={term}
                term={term}
                type="used"
              />
            ))}

            {missingKeywords.map((term) => (
              <KeywordRow
                key={term}
                term={term}
                type="missing"
              />
            ))}
          </div>
        )}
      </section>

      {/* Topics */}
      <section className="border-t border-border pt-5">
        <SectionHeader
          icon={Target}
          title="Topics"
          description={`${coveredTopics.length} of ${topics.length} covered`}
        />

        {topics.length === 0 ? (
          <EmptyState text="No recommended topics available." />
        ) : (
          <div className="mt-3 space-y-2">
            {coveredTopics.map((topic) => (
              <TopicRow
                key={topic}
                topic={topic}
                covered
              />
            ))}

            {missingTopics.map((topic) => (
              <TopicRow
                key={topic}
                topic={topic}
                covered={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Content metrics */}
      <section className="border-t border-border pt-5">
        <SectionHeader
          icon={FileText}
          title="Content"
          description="Basic content metrics"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric
            label="Words"
            value={wordCount.toLocaleString()}
          />

          <Metric
            label="Keywords"
            value={usedKeywords.length}
          />

          <Metric
            label="Topics"
            value={coveredTopics.length}
          />

          <Metric
            label="WDF-IDF terms"
            value={wdfIdfTerms.length}
          />
        </div>
      </section>

      {/* WDF-IDF */}
      <section className="border-t border-border pt-5">
        <SectionHeader
          icon={TrendingUp}
          title="WDF-IDF"
          description="Compared with competitor content"
        />

        {wdfIdfTerms.length === 0 ? (
          <EmptyState text="No WDF-IDF analysis available yet." />
        ) : (
          <div className="mt-3 space-y-3">
            {wdfIdfTerms.slice(0, 8).map((term) => {
              const articleWeight = term.articleWeight ?? 0;
              const competitorAverage = term.competitorAverage ?? 0;

              const difference =
                articleWeight - competitorAverage;

              return (
                <div
                  key={term.term}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-medium text-foreground">
                      {term.term}
                    </span>

                    <span
                      className={`shrink-0 text-xs ${
                        difference >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}
                    >
                      {difference >= 0 ? '+' : ''}
                      {difference.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          Math.max(articleWeight * 100, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>
                      Article {articleWeight.toFixed(2)}
                    </span>

                    <span>
                      Competitors {competitorAverage.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function calculateSEOScore({
  article,
  wordCount,
  usedKeywords,
  totalKeywords,
  coveredTopics,
  totalTopics,
}: {
  article: any;
  wordCount: number;
  usedKeywords: number;
  totalKeywords: number;
  coveredTopics: number;
  totalTopics: number;
}) {
  if (article?.seoScore != null) {
    return article.seoScore;
  }

  let score = 0;

  // Basic content length.
  if (wordCount >= 300) score += 20;
  else if (wordCount >= 150) score += 10;

  // Keyword coverage.
  if (totalKeywords > 0) {
    score += Math.round(
      (usedKeywords / totalKeywords) * 40
    );
  } else {
    score += 20;
  }

  // Topic coverage.
  if (totalTopics > 0) {
    score += Math.round(
      (coveredTopics / totalTopics) * 30
    );
  } else {
    score += 20;
  }

  // Metadata.
  if (article?.metaTitle) score += 5;
  if (article?.metaDescription) score += 5;

  return Math.min(score, 100);
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Hash;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

      <div>
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function KeywordRow({
  term,
  type,
}: {
  term: string;
  type: 'used' | 'missing';
}) {
  const used = type === 'used';

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2">
      {used ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-400" />
      )}

      <span className="truncate text-xs text-foreground">
        {term}
      </span>
    </div>
  );
}

function TopicRow({
  topic,
  covered,
}: {
  topic: string;
  covered: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2">
      {covered ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-400" />
      )}

      <span className="truncate text-xs text-foreground">
        {topic}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="mt-3 text-xs leading-5 text-muted-foreground">
      {text}
    </p>
  );
}