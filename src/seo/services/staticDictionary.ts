// 1. Direct JSON import (Works seamlessly in both Vite browser & Node server)
import zipfEn from '../data/zipf-en';

// Registry of loaded language dictionaries
const DICTIONARIES: Record<string, Record<string, number>> = {
  en: zipfEn as Record<string, number>,
};

/**
 * Returns the dictionary for a language code.
 * Falls back to an empty object if a language is not registered yet.
 */
export function getDictionaryForLanguage(lang = 'en'): Record<string, number> {
  const normalizedLang = lang.toLowerCase().slice(0, 2);
  return DICTIONARIES[normalizedLang] ?? {};
}

/**
 * Returns the Global Inverse Document Frequency based on broad language usage.
 * Scale: 0.5 (Extremely common, e.g. "time") to 5.0 (Niche/Specific, e.g. "pickaxe")
 */
export function getGlobalBackgroundIDF(term: string, lang = 'en'): number {
  const dictionary = getDictionaryForLanguage(lang);
  const words = term.toLowerCase().trim().split(/\s+/);

  // Single word evaluation
  if (words.length === 1) {
    const zipf = dictionary[words[0]] ?? 2.0;
    return Math.max(0.5, 7.0 - zipf);
  }

  // Multi-word phrase evaluation (Find the most specific anchor word)
  let minZipf = 7.0;

  for (const word of words) {
    const zipf = dictionary[word] ?? 2.0;
    if (zipf < minZipf) {
      minZipf = zipf;
    }
  }

  return Math.max(0.5, 7.0 - minZipf);
}