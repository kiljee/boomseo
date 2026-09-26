import { runContentResearch } from 'wasp/server/jobs';
    
    /**
     * QUERY: Fetch competitor content research for a keyword or workspace
     */
    export const getContentResearch = async (
      args: { keywordId: string },
      context: any
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
    
      const organizationId = context.user.activeOrganizationId;
      if (!organizationId) {
        throw new Error('No active workspace selected');
      }
    
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
    
    /**
     * ACTION: Trigger async competitor research for a target keyword
     */

    /*
    export const startContentResearch = async (
      args: { keywordId: string },
      context: any
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
    
      const organizationId = context.user.activeOrganizationId;
      if (!organizationId) {
        throw new Error('No active workspace selected');
      }
    
      const keyword = await context.entities.SEOKeyword.findFirst({
        where: {
          id: args.keywordId,
          organizationId,
        },
      });
    
      if (!keyword) {
        throw new Error('Keyword not found');
      }
    
      // Create initial ContentResearch record in PENDING state
      const research = await context.entities.ContentResearch.create({
        data: {
          organizationId,
          keywordId: args.keywordId,
          status: 'PENDING',
        },
      });
    
      // Submit background job worker
      await runContentResearch.submit({
        researchId: research.id,
      });
    
      return research;
    };

    */


export const startContentResearchTest = async (
  { keywordId }: { keywordId: string },
  context: any
) => {
  const keyword =
    await context.entities.SEOKeyword.findUnique({
      where: {
        id: keywordId,
      },
    });

  if (!keyword) {
    throw new Error("Keyword not found");
  }

  const research =
    await context.entities.ContentResearch.create({
      data: {
        organizationId:
          keyword.organizationId,
        keywordId: keyword.id,
        status: "PENDING",
      },
    });

  await runContentResearch.submit({
    researchId: research.id,
  });

  return {
    researchId: research.id,
  };
};