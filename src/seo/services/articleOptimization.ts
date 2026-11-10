import { optimizeArticleJob } from 'wasp/server/jobs';

export interface StartArticleOptimizationInput {
  targetKeyword: string;
  originalContent: string;
  tone?: string;
  model?: string;
  keywords: Array<{
    term: string;
    articleWeight: number;
    urlScore: number;
    competitorAverage: number;
    lowerBound: number;
    upperBound: number;
    difference: number;
    competitors: number;
  }>;
}

export const startArticleOptimization = async (
  args: StartArticleOptimizationInput,
  context: any
) => {
  const { targetKeyword, originalContent, tone, model, keywords } = args;

  if (!originalContent?.trim()) {
    throw new Error('Original content is required.');
  }

  const organizationId = context.user?.activeOrganizationId || null;

  // Create a brand new ArticleOptimization row every run
  const record = await context.entities.ArticleOptimization.create({
    data: {
      organizationId,
      targetKeyword: targetKeyword || 'General SEO',
      originalContent,
      tone: tone || 'Professional',
      model: model || 'gpt-4o-mini',
      keywords,
      status: 'PENDING',
    },
  });

  // Submit background job with the newly created optimization ID
  await optimizeArticleJob.submit({
    optimizationId: record.id,
  });

  return {
    optimizationId: record.id,
  };
};

export const getArticleOptimization = async (
  args: { optimizationId: string },
  context: any
) => {
  if (!args?.optimizationId) {
    return null;
  }

  return context.entities.ArticleOptimization.findUnique({
    where: { id: args.optimizationId },
  });
};