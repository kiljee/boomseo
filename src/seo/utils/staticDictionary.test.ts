// test-dict.ts
import { getGlobalBackgroundIDF, getDictionaryForLanguage } from '../services/staticDictionary';

console.log('--- TESTING STATIC DICTIONARY ---\n');

// 1. Check if the dictionary JSON was loaded
const enDict = getDictionaryForLanguage('en');
const wordCount = Object.keys(enDict).length;
console.log(`[Status] English dictionary loaded with ${wordCount} words.`);

if (wordCount === 0) {
  console.log('⚠️  Notice: No zipf-en.json found. Using built-in fallback (all words get default score 5.0).\n');
} else {
  console.log('✅ Dictionary successfully mounted!\n');
}

// 2. Test Word Scores
const testWords = [
  // Everyday filler words (SHOULD BE LOW: ~0.5 - 2.0)
  'actually',
  'eventually',
  'probably',
  'important',
  'different',
  'time',

  // Topic specific / Minecraft niche words (SHOULD BE HIGH: ~4.5 - 5.0)
  'pickaxe',
  'netherite',
  'crafting',
  'redstone',
  'creeper',
  'cobblestone',
  
  // Bigrams
  'crafting table',
  'wooden pickaxe',
  'social media',
];

console.log('Word / Phrase          | Global IDF Score | Result');
console.log('-----------------------|------------------|----------------------');

for (const word of testWords) {
  const score = getGlobalBackgroundIDF(word, 'en');
  const tag = score >= 4.0 ? '🌟 High (Topic Niche)' : '📉 Low (Filler Word)';
  console.log(`${word.padEnd(22)} | ${score.toFixed(2).padEnd(16)} | ${tag}`);
}

console.log('\n--- TEST COMPLETE ---');