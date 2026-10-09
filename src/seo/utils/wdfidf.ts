import { removeStopwords, eng as en, hrv as sr } from 'stopword';

export interface WdfIdfTerm {
  term: string;
  idf: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  competitors: number;
}

export interface ArticleWdfIdfTerm {
  term: string;
  articleWeight: number;
  competitorAverage: number;
  difference: number;
  competitors: number;
}

function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u00ad]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidToken(word: string): boolean {
  if (!/\p{L}/u.test(word)) {
    return false;
  }

  if (word.length < 3) {
    return false;
  }

  if (word.length > 30) {
    return false;
  }

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
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }

  return bigrams;
}



export function analyzeWdfIdf(
  pages: { text: string }[]
): WdfIdfTerm[] {
  const documents = pages.map((page) => {
    const words = tokenize(page.text);
    const bigrams = generateBigrams(words);

    return [
      ...words,
      ...bigrams,
    ];
  });

  const N = documents.length;

  if (N === 0) {
    return [];
  }

  const documentFrequency = new Map<string, number>();

  for (const document of documents) {
    const uniqueTerms = new Set(document);

    for (const term of uniqueTerms) {
      documentFrequency.set(
        term,
        (documentFrequency.get(term) ?? 0) + 1
      );
    }
  }

  const scores = new Map<
    string,
    {
      idf: number;
      scores: number[];
    }
  >();

  for (const document of documents) {
    const counts = new Map<string, number>();

    for (const term of document) {
      counts.set(
        term,
        (counts.get(term) ?? 0) + 1
      );
    }

    for (const [term, count] of counts) {
      const wdf = count / document.length;

      const df = documentFrequency.get(term) ?? 0;

      //const idf = Math.log(N / (1 + df));
      const idf = Math.log((N + 1) / (df + 1)) + 1;

      const score = wdf * idf;

      if (!scores.has(term)) {
        scores.set(term, {
          idf,
          scores: [],
        });
      }

      scores.get(term)!.scores.push(score);
    }
  }

  return [...scores.entries()]
    .map(([term, data]) => ({
      term,
      idf: data.idf,
      averageScore:
        data.scores.reduce(
          (sum, value) => sum + value,
          0
        ) / data.scores.length,
      minScore: Math.min(...data.scores),
      maxScore: Math.max(...data.scores),
      competitors: data.scores.length,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 100);
}

export function calculateArticleWdfIdf(
  articleText: string,
  competitorTerms: WdfIdfTerm[]
): ArticleWdfIdfTerm[] {
  const words = tokenize(articleText);

  if (words.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();

  for (const word of words) {
    counts.set(
      word,
      (counts.get(word) ?? 0) + 1
    );
  }

  return competitorTerms.map((term) => {
    const count = counts.get(term.term) ?? 0;

    const wdf = count / words.length;

    const articleWeight = wdf * term.idf;

    return {
      term: term.term,
      articleWeight,
      competitorAverage: term.averageScore,
      difference:
        articleWeight - term.averageScore,
      competitors: term.competitors,
    };
  });
}

/*const STOPWORDS = new Set([
  'i', 'ili', 'a', 'ali', 'da', 'je', 'su', 'se', 'sa', 'za', 'od',
  'do', 'u', 'na', 'o', 'po', 'iz', 'kod', 'ka', 'uz', 'bez',
  'kao', 'što', 'koji', 'koja', 'koje', 'ko', 'to', 'taj', 'ta',
  'te', 'ovaj', 'ova', 'ovo', 'biti', 'bio', 'bila', 'bilo',
  'ima', 'imao', 'imati', 'može', 'mogu', 'možeš',

  'the', 'and', 'or', 'but', 'for', 'with', 'from', 'that', 'this',
  'these', 'those', 'are', 'was', 'were', 'is', 'be', 'to', 'of',
  'in', 'on', 'at', 'by', 'as', 'an', 'a', 'it', 'its', 'can',
]);*/




