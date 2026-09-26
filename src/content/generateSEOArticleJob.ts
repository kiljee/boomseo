import { type GenerateSEOArticleJob } from "wasp/server/jobs"
import OpenAI from "openai";
import { env } from "wasp/server";
import { performContentResearch } from '../seo/services/contentResearchService';

const openAi = new OpenAI({apiKey: env.OPENAI_API_KEY});

const googleAi = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});


/*
export const generateSEOArticleJob: GenerateSEOArticleJob<
      {
        articleId: string;
        keywordId: string;
        targetKeyword: string;
        tone?: string;
        organizationId: string;
      },
      void
    > = async ({ articleId, keywordId, targetKeyword, tone, organizationId },
  context) => {
      console.log(`[generateSEOJob] Starting background generation for
  article: ${articleId}`);
    
      try {
        // 1. Fetch registered workspace competitors
        const competitors = await context.entities.Competitor.findMany({
          where: { organizationId },
        });
    
        const competitorUrls: string[] = competitors.map((c: any) => c.url);
    
        if (competitorUrls.length === 0) {
          competitorUrls.push(`https://${targetKeyword.replace(/\s+/g, '')}.
  com`);
        }
    
        // 2. Perform H1/H2 Content Gap Analysis
        console.log(`[generateSEOArticleJob] Analyzing competitor H1/H2
  content gaps for: "${targetKeyword}"...`);
        const gapAnalysis = await analyzeContentGaps(targetKeyword,
  competitorUrls);
    
        // 3. Send Content Gaps & Heading Outline to OpenAI LLM
        console.log("[generateSEOArticleJob] Generating full article with OpenAI API...");
    
        let articleTitle = `${targetKeyword.charAt(0).toUpperCase() +
  targetKeyword.slice(1)}: The Complete Guide`;
        let metaTitle = `${articleTitle} | BoomSEO`;
        let metaDescription = `Discover key insights about ${targetKeyword}.
  Learn about content gaps, best practices, and expert strategies.`;
        let markdownContent = '';
    
        try {
          const prompt = `
    You are an expert SEO copywriter and content strategist. 
    Write a high-ranking, comprehensive, long-form SEO blog post in Markdown
  format for the target keyword: "${targetKeyword}".
    
    Tone of Voice: ${tone || 'Professional'}
    Target Word Count: ~${gapAnalysis.targetWordCount} words
    
    Competitor Content Gaps to Address:
    ${gapAnalysis.contentGaps.map((gap, i) => `${i + 1}. ${gap}`).join('\n')}
    
    Recommended Heading Outline:
    ${gapAnalysis.recommendedOutline.map((h) => `- ${h.level.toUpperCase()}:
  ${h.title}`).join('\n')}
    
    Instructions:
    1. Include an engaging H1 Title at the very top.
    2. Structure the article cleanly with H2 and H3 headings.
    3. Address all competitor content gaps directly to provide superior value
  over competing articles.
    4. Include actionable advice, bullet points, and an FAQ section at the
  end.
    5. Return ONLY the Markdown content of the article.
    `;
    
      const stream = await openAi.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an elite SEO content generator that writes detailed, highly engaging Markdown articles designed to outrank competitors.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        stream: true,
      });

      let rawContent = "";
      let lastSavedAt = Date.now();

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";

        if (!text) continue;

        rawContent += text;

        markdownContent = rawContent
        .replace(/^```(?:markdown)?\s*\n?/i, "")
        .replace(/\n?\s*```$/i, "")
        .trim();

        // Save partial content roughly every 750ms
        if (Date.now() - lastSavedAt >= 750) {
          await context.entities.SEOArticle.update({
            where: { id: articleId },
            data: {
              content: markdownContent,
            },
          });

          lastSavedAt = Date.now();
        }


      }

      // Final content cleanup
      markdownContent = rawContent
        .replace(/^```(?:markdown)?\s*\n?/i, "")
        .replace(/\n?\s*```$/i, "")
        .trim();


          // Extract H1 title from generated Markdown if present
          const firstH1 = markdownContent.match(/^#\s+(.+)$/m);
          if (firstH1) {
            articleTitle = firstH1[1].trim();
            metaTitle = `${articleTitle.slice(0, 55)} | BoomSEO`;
          }
    
          metaDescription = `Comprehensive guide to ${targetKeyword}. Learn
  key strategies, answer top questions, and outrank competitors.`.slice(0,
  155);
    
        } catch (openAiError) {
          console.warn("[generateSEOArticleJob] OpenAI API call failed or key missing. Falling back to outline template:", openAiError);
    
          // Fallback template if OpenAI API key is unavailable or fails
          markdownContent = `
    # ${articleTitle}
    
    *Tone of Voice:* ${tone || 'Professional'}  
    *Target Word Count:* ${gapAnalysis.targetWordCount} words  
    
    ---
    
    ## Content Gap Overview
    This article addresses **${gapAnalysis.contentGaps.length} major content
  gaps** identified across competitor H1/H2 headings:
    
    ${gapAnalysis.contentGaps.map((gap) => `- **${gap}**`).join('\n')}
    
    ---
    
    ${gapAnalysis.recommendedOutline
      .map(
        (sec) => `## ${sec.title}\n\n*Strategic Note: ${sec.
  rationale}*\n\nDetailed content covering ${sec.title.toLowerCase()}...`
      )
      .join('\n\n')}
    `;
        }
    
        // Calculate word count of generated article
        const actualWordCount = markdownContent.trim().split(/\s+/).length;
        const slug = targetKeyword
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
    
        // 4. Update the SEOArticle in Database to status DRAFT
        await context.entities.SEOArticle.update({
          where: { id: articleId },
          data: {
            title: articleTitle,
            metaTitle,
            metaDescription,
            slug,
            content: markdownContent,
            status: 'DRAFT',
            wordCount: actualWordCount,
            seoScore: 92,
            contentBrief: {
              competitorsAnalyzed: gapAnalysis.competitorsAnalyzed,
              contentGaps: gapAnalysis.contentGaps,
              outline: gapAnalysis.recommendedOutline,
            },
          },
        });
    
        console.log(`[generateSEOArticleJob] Article ${articleId}
  successfully generated and updated to DRAFT.`);
      } catch (error) {
        console.error(`[generateSEOArticleJob] Job failed for article
  ${articleId}:`, error);
        await context.entities.SEOArticle.update({
          where: { id: articleId },
          data: { status: 'FAILED' },
        });
      }
    };

*/

 export const generateSEOArticleJob: GenerateSEOArticleJob<
      {
        articleId: string;
        keywordId: string;
        targetKeyword: string;
        tone?: string;
        model: string;
        researchId: string;
        organizationId: string;
      },
      void
    > = async ({ articleId, keywordId, targetKeyword, tone, model, researchId, organizationId },
  context) => {
      console.log(`[generateSEOArticleJob] Starting article generation for
  articleId: ${articleId}`);
    
      try {

        // 1. Research
        await performContentResearch(researchId, context);

        const research = await context.entities.ContentResearch.findFirst({
          where: {
            keywordId,
            organizationId,
            status: 'COMPLETED',
          },
          orderBy: { createdAt: 'desc' },
        });
    
        // Extract competitor topics & outline from ContentResearch entity
        const contentGaps: string[] = (research?.contentGaps as string[]) ||
  [];
        const recommendedOutline: any[] = (research?.recommendedOutline as
  any[]) || [];
        const targetWordCount = 2000;
    
        // 2. Build prompt for OpenAI incorporating research data
        console.log(`[generateSEOArticleJob] Feeding ${contentGaps.length}
  competitor topics to OpenAI...`);
    
        let articleTitle = `${targetKeyword.charAt(0).toUpperCase() +
  targetKeyword.slice(1)}: The Complete Guide`;
        let metaTitle = `${articleTitle}`;
        let metaDescription = `Comprehensive guide covering ${targetKeyword}.
  `;
        let markdownContent = '';
    
        try {
          const prompt = `
    You are an expert SEO copywriter. Write a comprehensive, long-form
  Markdown blog post targeting the keyword: "${targetKeyword}".
    
    Tone of Voice: ${tone || 'Professional'}
    Target Word Count: ~${targetWordCount} words
    
    Competitor Content Topics to Cover:
    ${contentGaps.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}
    
    Recommended Heading Outline:
    ${recommendedOutline.map((h) => `- ${h.level?.toUpperCase() || 'H2'}: 
  ${h.title}`).join('\n')}
    
    Instructions:
    1. Write a clean Markdown document starting with an H1 title.
    2. Address all competitor topics thoroughly to create an article superior
  to competitor pages.
    3. Return ONLY the Markdown content.
    `;

        const isGemini =
          model === "gemini-3.6-flash" ||
          model === "gemini-3.8-flash";

        const ai = isGemini ? googleAi : openAi;

        const completion = await ai.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: "You are an elite SEO content generator.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 1.0,
        });

    
          const rawContent = completion.choices[0]?.message?.content || '';
    
          // Strip markdown code block wrappers
          markdownContent = rawContent
            .replace(/^```(?:markdown)?\s*\n?/i, '')
            .replace(/\n?\s*```$/i, '')
            .trim();
    
          const firstH1 = markdownContent.match(/^#\s+(.+)$/m);
          if (firstH1) {
            articleTitle = firstH1[1].trim();
            metaTitle = `${articleTitle.slice(0, 55)} | BoomSEO`;
          }
          metaDescription = `Learn everything about ${targetKeyword}. In-
  depth guide covering key strategies and competitor insights.`.slice(0, 155);
    
        } catch (openAiError) {
          console.warn(`[generateSEOArticleJob] OpenAI call failed, using
  fallback outline:`, openAiError);
          markdownContent = `# ${articleTitle}\n\n## Competitor Topics\n\n` +
  contentGaps.map((g) => `- ${g}`).join('\n');
        }
    
        const wordCount = markdownContent.trim().split(/\s+/).length;
        const slug = targetKeyword
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const competitorWdfIdf = (research?.wdfIdfAnalysis as WdfIdfTerm[] | undefined) ?? [];

          console.log(
          '[WDF-IDF] research.wdfIdfAnalysis:',
          JSON.stringify(research?.wdfIdfAnalysis, null, 2)
        );


        const articleWdfIdf = calculateArticleWdfIdf(
          markdownContent,
          competitorWdfIdf
        );

        console.log("Article WDF-IDF: "+JSON.stringify(articleWdfIdf, null, 2));
            
        // 3. Update SEOArticle to DRAFT
        await context.entities.SEOArticle.update({
          where: { id: articleId },
          data: {
            title: articleTitle,
            metaTitle,
            metaDescription,
            slug,
            content: markdownContent,
            status: 'DRAFT',
            wordCount,
            seoScore: 92,
            wdfIdfAnalysis: {
              terms: articleWdfIdf,
            },
            contentBrief: {
              contentGaps,
              outline: recommendedOutline,
            },
          },
        });
    
        console.log(`[generateSEOArticleJob] Completed article
  ${articleId}!`);
      } catch (error) {
        console.error(`[generateSEOArticleJob] Job failed for article
  ${articleId}:`, error);
        await context.entities.SEOArticle.update({
          where: { id: articleId },
          data: { status: 'FAILED' },
        });
      }
    };



export function calculateArticleWdfIdf(
  articleText: string,
  competitorTerms: WdfIdfTerm[]
) {
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

export interface WdfIdfTerm {
  term: string;
  idf: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  competitors: number;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .filter((word) => !STOPWORDS.has(word));
}

const STOPWORDS = new Set([
  'i', 'ili', 'a', 'ali', 'da', 'je', 'su', 'se', 'sa', 'za', 'od',
  'do', 'u', 'na', 'o', 'po', 'iz', 'kod', 'ka', 'uz', 'bez',
  'kao', 'što', 'koji', 'koja', 'koje', 'ko', 'to', 'taj', 'ta',
  'te', 'ovaj', 'ova', 'ovo', 'biti', 'bio', 'bila', 'bilo',
  'ima', 'imao', 'imati', 'može', 'mogu', 'možeš',

  'the', 'and', 'or', 'but', 'for', 'with', 'from', 'that', 'this',
  'these', 'those', 'are', 'was', 'were', 'is', 'be', 'to', 'of',
  'in', 'on', 'at', 'by', 'as', 'an', 'a', 'it', 'its', 'can',
]);