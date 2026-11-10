// scripts/download-dictionary.mjs
import fs from 'node:fs';
import path from 'node:path';

// Pick your target language code:
// 'de' (German), 'fr' (French), 'es' (Spanish), 'it' (Italian),
// 'sr' (Serbian), 'hr' (Croatian), 'nl' (Dutch), 'pl' (Polish), 'en' (English)
const LANG = process.argv[2] || 'new';

const SOURCE_URL = `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/${LANG}/${LANG}_50k.txt`;
const OUTPUT_DIR = path.resolve('src/seo/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, `zipf-${LANG}.json`);

async function generateDictionary() {
  console.log(`Downloading ${LANG} word frequencies from HermitDave repo...`);
  const response = await fetch(SOURCE_URL);

  if (!response.ok) {
    throw new Error(`Failed to download: HTTP ${response.status}. Check language code.`);
  }

  const rawText = await response.text();
  const lines = rawText.split('\n');

  let totalTokens = 0;
  const wordCounts = [];

  // Parse lines (format: "word count")
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2) {
      const word = parts[0].toLowerCase();
      const count = parseInt(parts[1], 10);
      if (!isNaN(count) && word.length >= 2) {
        wordCounts.push({ word, count });
        totalTokens += count;
      }
    }
  }

  // Calculate Zipf scale (log10(freq_per_billion))
  // We keep only the top 15,000 words (sufficient to capture all conversational noise)
  const zipfDictionary = {};
  const topWords = wordCounts.slice(0, 15000);

  for (const item of topWords) {
    // Standard Zipf formula: log10(frequency per billion tokens)
    const freqPerBillion = (item.count / totalTokens) * 1_000_000_000;
    const zipf = Math.round((Math.log10(freqPerBillion)) * 10) / 10;
    
    // Only store words with Zipf >= 3.5 (conversational/common words)
    if (zipf >= 3.5) {
      zipfDictionary[item.word] = zipf;
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(zipfDictionary));

  console.log(`Successfully generated: ${OUTPUT_FILE}`);
  console.log(`Words indexed: ${Object.keys(zipfDictionary).length}`);
}

generateDictionary().catch(console.error);