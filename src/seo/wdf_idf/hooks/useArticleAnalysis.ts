import { useMemo } from 'react';
import { calculateArticleWdfIdf } from '../../utils/wdfidf';

import type {
  AnalysisResult,
  ArticleWdfIdfTerm,
} from '../types';

export interface EnrichedArticleTerm extends ArticleWdfIdfTerm {
  maximumScore: number;
  minimumScore: number;
}

export function useArticleAnalysis(
  text: string,
  research: AnalysisResult | null
) {
  // 1. Build a lookup map of competitor stats (maxScore, minScore) by term
  const competitorStatsMap = useMemo(() => {
    const map = new Map<string, { maxScore: number; minScore: number }>();
    if (!research?.wdfIdf) return map;

    for (const item of research.wdfIdf) {
      map.set(item.term, {
        maxScore: item.maxScore ?? item.averageScore * 1.5,
        minScore: item.minScore ?? 0,
      });
    }
    return map;
  }, [research]);

  // 2. Calculate article WDF*IDF and attach `maximumScore` to each term
  const articleAnalysis = useMemo<EnrichedArticleTerm[]>(() => {
    if (!research || !text.trim()) {
      return [];
    }

    const rawAnalysis = calculateArticleWdfIdf(
      text,
      research.wdfIdf ?? []
    );

    return rawAnalysis.map((item) => {
      const stats = competitorStatsMap.get(item.term);
      const maximumScore = stats?.maxScore ?? (item as any).maxScore ?? item.competitorAverage * 1.5;
      const minimumScore = stats?.minScore ?? (item as any).minScore ?? 0;

      return {
        ...item,
        maximumScore,
        minimumScore,
      };
    });
  }, [text, research, competitorStatsMap]);

  // 3. Underused: Weight is greater than 0, but below competitor average
  const underusedTerms = useMemo(
    () =>
      articleAnalysis
        .filter(
          (term) =>
            term.articleWeight > 0 &&
            term.articleWeight < term.competitorAverage
        )
        .sort((a, b) => a.articleWeight - b.articleWeight)
        .slice(0, 10),
    [articleAnalysis]
  );

  // 4. Overused: Weight strictly exceeds the competitor maximumScore!
  const overusedTerms = useMemo(
    () =>
      articleAnalysis
        .filter(
          (term) =>
            term.articleWeight > term.maximumScore * 1.25 // <-- Correct operator (>) and threshold
        )
        .sort((a, b) => b.articleWeight - a.articleWeight)
        .slice(0, 10),
    [articleAnalysis]
  );

  // 5. Highest score for chart normalization
  const maxScore = useMemo(
    () =>
      Math.max(
        0,
        ...articleAnalysis.map((term) =>
          Math.max(term.articleWeight, term.maximumScore)
        )
      ),
    [articleAnalysis]
  );

  return {
    articleAnalysis,
    underusedTerms,
    overusedTerms,
    maxScore,
  };
}