import { removeStopwords, eng as en, hrv as sr } from 'stopword';
import { getGlobalBackgroundIDF } from '../services/staticDictionary'; 


export interface WdfIdfTerm {
  term: string;
  idf: number;
  averageScore: number;
  averageUsed: number;
  minScore: number;
  maxScore: number;
  medianScore: number;
  lowerBound: number;
  upperBound: number;
  competitors: number;
};

export interface ArticleWdfIdfTerm {
  term: string;
  articleWeight: number;
  urlScore: number;
  competitorAverage: number;
  lowerBound: number;
  upperBound: number;
  difference: number;
  competitors: number;
}

// Common web, publishing, and boilerplate noise words


function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u00ad]/g, '')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidToken(word: string): boolean {
  if (!/\p{L}/u.test(word)) {
    return false;
  }

  // Filter 1-2 letter words and pure numbers
  if (word.length < 3 || word.length > 30) {
    return false;
  }

  // Filter web noise & dates
  /*if (SEO_NOISE_WORDS.has(word)) {
    return false;
  }*/

  return true;
}

export function tokenize(text: string, language = 'en'): string[] {
  const normalized = normalizeText(text);

  const words = normalized
    .split(/\s+/)
    .filter(Boolean)
    .filter(isValidToken);

  const stopwords = language === 'sr' ? sr : en;

  return removeStopwords(words, stopwords) as string[];
}

function generateBigrams(words: string[]): string[] {
  const bigrams: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const first = words[i];
    const second = words[i + 1];

    // Don't generate bigrams containing noise words or identical repetitions
    if (first !== second /*&& !SEO_NOISE_WORDS.has(first) && !SEO_NOISE_WORDS.has(second)*/) {
      bigrams.push(`${first} ${second}`);
    }
  }

  return bigrams;
}

export function buildDocumentTerms(
  text: string,
  language = 'en'
): string[] {
  const words = tokenize(text, language);
  return [...words, ...generateBigrams(words)];
}

/**
 * Standard Logarithmic WDF (Harman 1992):
 * wdf = log2(tf + 1) / log2(docLength + 1)
 */
function calculateWDF(count: number, docLength: number): number {
  if (count <= 0 || docLength <= 0) return 0;
  return Math.log2(count + 1) / Math.log2(docLength + 1);
}

/**
 * Smoothed IDF for SEO (ensures terms present on all pages are NOT zeroed out)
 */
function calculateIDF(N: number, df: number): number {
  return Math.log2((N + 1) / (df + 1)) + 1;
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);

  const index = (sorted.length - 1) * percentile;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return sorted[lowerIndex];
  }

  const fraction = index - lowerIndex;

  return (
    sorted[lowerIndex] * (1 - fraction) +
    sorted[upperIndex] * fraction
  );
}

export function analyzeWdfIdf(
  pages: { text: string }[],
  language = 'en'
): WdfIdfTerm[] {
  const documents = pages.map((page) =>
    buildDocumentTerms(page.text, language)
  );

  const N = documents.length;

  if (N === 0) {
    return [];
  }

  // 1. Calculate Document Frequency (DF) for each term
  const documentFrequency = new Map<string, number>();

  for (const document of documents) {
    const uniqueTerms = new Set(document);
    for (const term of uniqueTerms) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  // 2. Minimum Document Frequency threshold:
  // Must appear in at least 2 pages (or 25% of competitors) to be considered consensus
  const minDocFrequency = N >= 4 ? Math.max(2, Math.floor(N * 0.2)) : 1;


  const termScoresMap = new Map<
  string,
  {
    idf: number;
    scores: number[];
    competitors: number;
  }
>();


  // 3. Calculate WDF * IDF for each document
  for (let documentIndex = 0; documentIndex < documents.length; documentIndex++) {
    const document = documents[documentIndex];
    const docLength = document.length;
    const counts = new Map<string, number>();

    for (const term of document) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }

    for (const [term, count] of counts) {
      const df = documentFrequency.get(term) ?? 0;

      if (df < minDocFrequency) {
        continue;
      }

      const wdf = calculateWDF(count, docLength);

      // 1. Local SERP IDF (Distribution across the 10 competitor pages)
      const localIDF = calculateIDF(N, df);

      // 2. Global Background IDF (Checks general European/English corpus frequency)
      const globalIDF = getGlobalBackgroundIDF(term, language);

      // 3. Blended Hybrid IDF: 60% Global Background + 40% Local SERP
      const idf = 0.6 * globalIDF + 0.4 * localIDF;

      if (!termScoresMap.has(term)) {
        termScoresMap.set(term, {
          idf,
          scores: Array(N).fill(0),
          competitors: df,
        });
      }

      const data = termScoresMap.get(term)!;
      data.scores[documentIndex] = wdf * idf;
    }
  }

  // 4. Calculate competitor statistics
  return [...termScoresMap.entries()]
    .map(([term, data]) => {
      const totalScore = data.scores.reduce(
        (sum, value) => sum + value,
        0,
      );

      // Average across all competitors, including missing terms
      const averageScore = totalScore / N;

      // Average only across competitors where the term appears
      const usedScores = data.scores.filter((score) => score > 0);

      const averageUsed =
        usedScores.length > 0
          ? usedScores.reduce((sum, value) => sum + value, 0) /
            usedScores.length
          : 0;

      return {
        term,
        idf: data.idf,
        averageScore,
        averageUsed,
        minScore: Math.min(...data.scores),
        maxScore: Math.max(...data.scores),
        medianScore: calculatePercentile(data.scores, 0.5),
        lowerBound: calculatePercentile(data.scores, 0.25),
        upperBound: calculatePercentile(data.scores, 0.75),
        competitors: data.competitors,
      };
    })
  .sort((a, b) => b.averageScore - a.averageScore)
  .slice(0, 100);
}

export function calculateArticleWdfIdf(
  articleText: string,
  competitorTerms: WdfIdfTerm[],
  language = 'en'
): ArticleWdfIdfTerm[] {
  const document = buildDocumentTerms(articleText, language);

  if (document.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();
  for (const term of document) {
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }

  const docLength = document.length;



  return competitorTerms.map((term) => {
    const count = counts.get(term.term) ?? 0;

    const wdf = calculateWDF(count, docLength);
    const articleWeight = wdf * term.idf;

    return {
      term: term.term,
      articleWeight,
      urlScore: articleWeight,
      competitorAverage: term.averageScore,
      lowerBound: term.lowerBound,
      upperBound: term.upperBound,
      difference: articleWeight - term.averageScore,
      competitors: term.competitors,
    };
  });
}