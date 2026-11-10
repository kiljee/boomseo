export type SERPResult = {
	position: number;
	title: string;
	url: string;
	snippet: string;
};


export type CompetitorPage = {
	url: string;
	title: string;
	metaDescription: string;
	h1: string[];
	h2: string[];
	h3: string[];
	text: string;
	wordCount: number;
};

export type WdfIdfTerm = {
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

export type AnalysisResult = {
	serpResults: SERPResult[];
	competitorPages: CompetitorPage[];
	wdfIdf: WdfIdfTerm[];
};

export type ChartTerm = {
  term: string;
  averageTotal: number;
  averageUsed: number;
  maximum: number;
  minimum: number;
  competitors: number;
  suggestedFrequency: number;
  urlScore: number;
};