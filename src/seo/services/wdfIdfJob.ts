// src/seo/services/wdfIdfJob.ts
import { performWdfIdfAnalysis } from './wdfIdfService';

export const runWdfIdfAnalysis = async (
  args: any,
  context: any
) => {
  const analysisId = args?.analysisId as string;

  if (!analysisId) {
    throw new Error('[WdfIdfJob] analysisId was not provided in job payload');
  }

  console.log(`[WdfIdfJob] Worker picked up analysisId: ${analysisId}`);

  const analysis = await context.entities.ContentResearch.findUnique({
    where: { id: analysisId },
    include: {
      keyword: true,
    },
  });

  if (!analysis) {
    console.error(`[WdfIdfJob] ContentResearch record not found: ${analysisId}`);
    throw new Error(`Analysis ${analysisId} not found`);
  }

  const keyword = analysis.keyword?.keyword;
  if (!keyword) {
    console.error(`[WdfIdfJob] SEOKeyword relation missing for record: ${analysisId}`);
    throw new Error(`Keyword relation not found for analysis ${analysisId}`);
  }

  // Reads persisted location and device settings from ContentResearch
  const targetCountry = analysis.targetCountry || 'US';
  const targetState = analysis.targetState || undefined;
  const device = analysis.device || 'desktop';

  try {
    await context.entities.ContentResearch.update({
      where: { id: analysisId },
      data: { status: 'RUNNING' },
    });

    console.log(
      `[WdfIdfJob] Running pipeline for keyword: "${keyword}" [Country: ${targetCountry}, Location: ${
        targetState || 'none'
      }, Device: ${device}]`
    );

    const result = await performWdfIdfAnalysis(keyword, context, {
      targetCountry,
      targetState,
      device,
    });

    await context.entities.ContentResearch.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        serpResults: result.serpResults,
        competitorPages: result.competitorPages.map((page: any) => ({
          url: page.url,
          title: page.title,
          metaDescription: page.metaDescription,
          headings: page.headings ?? {
            h1: page.h1 ?? [],
            h2: page.h2 ?? [],
            h3: page.h3 ?? [],
          },
          text: page.text,
          wordCount: page.wordCount,
        })),
        wdfIdfAnalysis: result.wdfIdf,
      },
    });

    console.log(`[WdfIdfJob] Analysis ${analysisId} completed and saved successfully.`);
    return { success: true, analysisId };
  } catch (error: any) {
    console.error(`[WdfIdfJob] ERROR processing analysis ${analysisId}:`, error?.stack || error);

    await context.entities.ContentResearch.update({
      where: { id: analysisId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
};