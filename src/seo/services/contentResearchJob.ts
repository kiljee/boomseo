import { executeContentResearch } from './contentResearchService';

export const runContentResearch = async (
  {
    researchId,
  }: {
    researchId: string;
  },
  context: any
) => {
  return executeContentResearch(researchId, context);
};