import { type GenerateSEOArticleJob } from "wasp/server/jobs"
import OpenAI from "openai";
import { env } from "wasp/server";
import { analyzeContentGaps } from "../seo/services/contentGapService";

const openAi = new OpenAI({apiKey: env.OPENAI_API_KEY});

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
