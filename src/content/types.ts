export type ContentBrief = {
  searchIntent?: string;
  suggestedTitle?: string;
  outline?: OutlineItem[];
  topics?: string[];
  questions?: string[];
  recommendedTerms?: string[];
};

export type OutlineItem = {
  heading: string;
  level: number;
};

export type WdfIdfTerm = {
  term: string;
  articleWeight: number;
  competitorAverage: number;
};

export type WdfIdfAnalysis = {
  terms?: WdfIdfTerm[];
  competitorCount?: number;
  analyzedAt?: string;
};