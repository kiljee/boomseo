import { describe, expect, it } from 'vitest';
import {
  analyzeWdfIdf,
  buildDocumentTerms,
  tokenize,
} from './wdfidf';

describe('tokenize', () => {
  it('splits camelCase before lowercasing', () => {
    expect(tokenize('BestContractor tools')).toEqual([
      'best',
      'contractor',
      'tools',
    ]);
  });

  it('removes common English stopwords', () => {
    expect(tokenize('the best tools for your team')).toEqual([
      'best',
      'tools',
      'team',
    ]);
  });

  it('normalizes punctuation and hyphens into word boundaries', () => {
    expect(tokenize("don't miss top‑rated SEO-tools")).toEqual([
      'don',
      'miss',
      'top',
      'rated',
      'seo',
      'tools',
    ]);
  });
});

describe('buildDocumentTerms', () => {
  it('includes bigrams after unigrams', () => {
    const terms = buildDocumentTerms('seo tools guide');

    expect(terms).toContain('seo');
    expect(terms).toContain('tools');
    expect(terms).toContain('seo tools');
    expect(terms).toContain('tools guide');
  });
});

describe('analyzeWdfIdf', () => {
  it('ranks distinctive terms above sitewide boilerplate', () => {
    const pages = [
      { text: 'seo tools guide for teams' },
      { text: 'seo tools comparison for agencies' },
      { text: 'best seo tools list for beginners' },
    ];

    const results = analyzeWdfIdf(pages);

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((row) => row.term.includes(' '))).toBe(true);

    const terms = results.map((row) => row.term);

    expect(terms).not.toContain('seo');
    expect(terms).not.toContain('tools');
    expect(terms).not.toContain('seo tools');
  });

  it('returns results for a single page', () => {
    const results = analyzeWdfIdf([
      { text: 'keyword research workflow for content teams' },
    ]);

    expect(results.length).toBeGreaterThan(0);
  });
});
