declare module 'stopword' {
  export function removeStopwords(
    input: string[],
    stopwords?: string[]
  ): string[];

  export const eng: string[];
  export const hrv: string[];
}