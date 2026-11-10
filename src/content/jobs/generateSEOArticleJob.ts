import type { GenerateSEOArticleJob } from "wasp/server/jobs";

import { performContentResearch } from "../../seo/services/contentResearchService";
import { generateArticleContent } from "../services/articleGenerationService";

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
> = async (
  {
    articleId,
    keywordId,
    targetKeyword,
    tone,
    model,
    researchId,
    organizationId,
  },
  context
) => {
  try {
    // 1. Perform competitor research
    await performContentResearch(researchId, context);

    // 2. Retrieve research results
    const research =
      await context.entities.ContentResearch.findFirst({
        where: {
          keywordId,
          organizationId,
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const contentGaps =
      (research?.contentGaps as string[]) ?? [];

    const recommendedOutline =
      (research?.recommendedOutline as any[]) ?? [];

    const competitorWdfIdf =
      (research?.wdfIdfAnalysis as any)?.terms ??
      (research?.wdfIdfAnalysis as any) ??
      [];

    // 3. Generate article content
    const article = await generateArticleContent({
      targetKeyword,
      tone,
      model,
      contentGaps,
      recommendedOutline,
      competitorWdfIdf,
    });

    // 4. Save article
    await context.entities.SEOArticle.update({
      where: { id: articleId },
      data: {
        ...article,
        status: "DRAFT",
        seoScore: 92,
      },
    });

    console.log(`Article ${articleId} generated successfully.`);

  } catch (error) {
    console.error(
      `Article generation failed for ${articleId}:`,
      error
    );

    await context.entities.SEOArticle.update({
      where: { id: articleId },
      data: { status: "FAILED" },
    });
  }
};