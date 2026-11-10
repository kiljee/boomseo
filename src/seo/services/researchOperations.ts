import { runContentResearch, runWdfIdfAnalysis } from 'wasp/server/jobs';
import { performWdfIdfAnalysis } from './wdfIdfService';

function assertAuthenticated(context: any): string {
  if (!context.user) {
    throw new Error('Not authenticated');
  }

  const organizationId = context.user.activeOrganizationId;
  if (!organizationId) {
    throw new Error('No active workspace selected');
  }

  return organizationId;
}

export const getContentResearch = async (
  args: { keywordId: string },
  context: any
) => {
  const organizationId = assertAuthenticated(context);

  return context.entities.ContentResearch.findFirst({
    where: {
      keywordId: args.keywordId,
      organizationId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      keyword: true,
    },
  });
};

export const getWdfIdfAnalysis = async (
  args: { analysisId: string },
  context: any
) => {
  const organizationId = assertAuthenticated(context);

  return context.entities.ContentResearch.findFirst({
    where: {
      id: args.analysisId,
      organizationId,
    },
    include: {
      keyword: true,
    },
  });
};

export const startContentResearch = async (
  { keyword }: { keyword: string },
  context: any
) => {
  const organizationId = assertAuthenticated(context);
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    throw new Error('Keyword is required');
  }

  let seoKeyword = await context.entities.SEOKeyword.findFirst({
    where: {
      keyword: normalizedKeyword,
      organizationId,
    },
  });

  if (!seoKeyword) {
    seoKeyword = await context.entities.SEOKeyword.create({
      data: {
        organizationId,
        keyword: normalizedKeyword,
        selected: false,
      },
    });
  }

  const research = await context.entities.ContentResearch.create({
    data: {
      organizationId,
      keywordId: seoKeyword.id,
      status: 'PENDING',
    },
  });

  await runContentResearch.submit({
    researchId: research.id,
  });

  return research;
};

export interface StartWdfIdfAnalysisArgs {
  keyword: string;
  targetUrl?: string;
  targetCountry?: string;
  targetState?: string;
  device?: 'desktop' | 'mobile';
}

export const startWdfIdfAnalysis = async (
  args: StartWdfIdfAnalysisArgs,
  context: any
) => {
  const organizationId = assertAuthenticated(context);
  const keyword = args.keyword.trim();

  if (!keyword) {
    throw new Error('Keyword is required');
  }

  const targetCountry = args.targetCountry?.trim() || 'US';
  const targetState = args.targetState?.trim() || null;
  const device = args.device || 'desktop';

  let seoKeyword = await context.entities.SEOKeyword.findFirst({
    where: {
      keyword,
      organizationId,
    },
  });

  if (!seoKeyword) {
    seoKeyword = await context.entities.SEOKeyword.create({
      data: {
        organizationId,
        keyword,
        selected: false,
      },
    });
  }

  const research = await context.entities.ContentResearch.create({
    data: {
      organizationId,
      keywordId: seoKeyword.id,
      status: 'PENDING',
      targetUrl: args.targetUrl?.trim() || null,
      targetCountry,
      targetState,
      device,
    },
  });

  await runWdfIdfAnalysis.submit({
    analysisId: research.id,
  });

  return {
    analysisId: research.id,
  };
};

export const analyzeWdfIdfKeyword = async (
  args: {
    keyword: string;
    targetCountry?: string;
    targetState?: string;
    device?: 'desktop' | 'mobile';
  },
  context: any
): Promise<any> => {
  assertAuthenticated(context);
  const keyword = args.keyword.trim();

  if (!keyword) {
    throw new Error('Keyword is required');
  }

  return performWdfIdfAnalysis(keyword, context, {
    targetCountry: args.targetCountry,
    targetState: args.targetState,
    device: args.device,
  });
};