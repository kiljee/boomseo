import OpenAI from 'openai';
import { env } from 'wasp/server';

const openAi = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const optimizeArticleJob = async (
  args: any,
  context: any
) => {
  const optimizationId = args?.optimizationId as string;

  if (!optimizationId) {
    throw new Error('[optimizeArticleJob] optimizationId was not provided.');
  }

  try {
    const optimization =
      await context.entities.ArticleOptimization.findUnique({
        where: { id: optimizationId },
      });

    if (!optimization) {
      throw new Error(`Article optimization ${optimizationId} not found.`);
    }

    await context.entities.ArticleOptimization.update({
      where: { id: optimizationId },
      data: { status: 'PROCESSING' },
    });

    const keywords = (optimization.keywords as any[]) || [];

    // 1. Missing Terms: Used 0 times (articleWeight <= 0)
    // Extract just clean string names
    const missingTerms = keywords
      .filter((term) => (term.articleWeight ?? 0) <= 0)
      .slice(0, 25)
      .map((t) => t.term);

    // 2. Underused Terms: Provide the term and a simple recommended count
    const underusedTerms = keywords
      .filter(
        (term) =>
          (term.articleWeight ?? 0) > 0 &&
          term.articleWeight < (term.lowerBound ?? term.competitorAverage)
      )
      .slice(0, 15)
      .map((t) => `${t.term} (increase presence naturally)`);

    // 3. Overused Terms: Mark terms that need reduction or synonym substitution
    const overusedTerms = keywords
      .filter(
        (term) =>
          term.articleWeight > (term.upperBound ?? term.competitorAverage * 1.4)
      )
      .slice(0, 10)
      .map((t) => `${t.term} (reduce repetition / use synonyms)`);

    // Build a clean, token-efficient prompt
    const prompt = `
You are an expert SEO copy editor specializing in WDF*IDF semantic content optimization.

PRIMARY TARGET KEYWORD:
"${optimization.targetKeyword}"

TONE OF VOICE:
${optimization.tone || 'Professional and informative'}

CURRENT DRAFT:
${optimization.originalContent}

SEMANTIC OPTIMIZATION TARGETS:
1. MISSING HIGH-VALUE TERMS (Must include. Integrate these naturally into relevant sections):
${missingTerms.length > 0 ? missingTerms.join(', ') : 'None'}

2. UNDERUSED TERMS (Increase topical coverage of these concepts):
${underusedTerms.length > 0 ? underusedTerms.join('\n- ') : 'None'}

3. OVERUSED TERMS (Tone down or swap with context-appropriate synonyms):
${overusedTerms.length > 0 ? overusedTerms.join('\n- ') : 'None'}

EDITORIAL GUIDELINES:
- Preserve the draft's core argument, structure, factual integrity, and intent.
- Do NOT keyword stuff. Every added term must read smoothly and provide genuine reader value.
- Maintain approximately the same overall word length (do not inflate with fluff).
- Preserve all Markdown formatting (headings #, ##, lists -, bolding **).
- Feel free to make the article longer if that helps.

Return ONLY the complete, optimized Markdown article without conversational preambles or postscripts.
`;

  console.log(prompt);

    const completion = await openAi.chat.completions.create({
      model: optimization.model || 'gpt-6-luna',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content optimizer. Output clean Markdown directly.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.35,
    });

    const rawOptimized = completion.choices[0]?.message?.content || '';

    const cleanOptimized = rawOptimized
      .replace(/^```(?:markdown)?\s*\n?/i, '')
      .replace(/\n?\s*```$/i, '')
      .trim();

    if (!cleanOptimized) {
      throw new Error('AI returned empty content.');
    }

    await context.entities.ArticleOptimization.update({
      where: { id: optimizationId },
      data: {
        optimizedContent: cleanOptimized,
        wordCount: cleanOptimized.split(/\s+/).filter(Boolean).length,
        status: 'COMPLETED',
      },
    });

    console.log(`[optimizeArticleJob] Optimization ${optimizationId} completed successfully.`);
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.stack || error.message : String(error);

    console.error(`[optimizeArticleJob] Failed:`, errorMsg);

    await context.entities.ArticleOptimization.update({
      where: { id: optimizationId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Article optimization failed.',
      },
    });

    throw error;
  }
};