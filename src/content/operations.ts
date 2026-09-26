import OpenAI from "openai";
import { env } from "wasp/server";
const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/**
 * Query: Fetch all generated blog posts/articles for the active workspace
 * */


export const getWorkspaceArticles = async(_args: void, context: any) => {
	if(!context.user) {
		throw new Error('Not authenticated');
	}

	const organizationId = context.user.activeOrganizationId;

	if(!organizationId) {
		throw new Error('No active workspace selected');
	}

	return context.entities.SEOArticle.findMany({
		where: { organizationId },
		orderBy: { createdAt: 'desc' },
		include: {
			keyword: true,
		},
	});
}

import { generateSEOArticleJob } from "wasp/server/jobs";


export const generateSEOArticle = async (
  args: { targetKeyword: string; tone?: string, model?: string },
  context: any
) => {
	  if (!context.user) {
	    throw new Error("Not authenticated");
	  }

	  const organizationId = context.user.activeOrganizationId;
	  if (!organizationId) {
	    throw new Error("No active workspace selected");
	  }

	  let keywordRecord = await context.entities.SEOKeyword.findFirst({
	  	where: { organizationId, keyword: args.targetKeyword },
	  });

	  if(!keywordRecord) {
	  	keywordRecord = await context.entities.SEOKeyword.create({
	  		data: {
	  			organizationId,
	  			keyword: args.targetKeyword,
	  			intent: "Informational",
	  			selected: true,
	  		},
	  	});
	  }

	  const initialTitle = `${args.targetKeyword.charAt(0).toUpperCase() + args.targetKeyword.slice(1)}: Generating...`;
	  const slug = args.targetKeyword
	  .toLowerCase()
	  .replace(/[^a-z0-9]+/g, '-')
	  .replace(/(^-|-$)/g, '');

	  const article = await context.entities.SEOArticle.create({
	  	data: {
	  		organizationId,
	  		keywordId: keywordRecord.id,
	  		title: initialTitle,
	  		slug,
	  		status: "GENERATING",
	  		content: "SEO Magic incoming...",
	  		wordCount: 0,
	  		seoScore: 0,
	  	},
	  	include: {
	  		keyword: true,
	  	},
	  });

	   // Create research
	  const research = await context.entities.ContentResearch.create({
	    data: {
	      organization: {
	        connect: { id: organizationId },
	      },
	      keyword: {
	        connect: { id: keywordRecord.id },
	      },
	      status: 'PENDING',
	    },
	  });

	  await generateSEOArticleJob.submit({
	  	articleId: article.id,
	  	keywordId: keywordRecord.id,
	  	targetKeyword: args.targetKeyword,
	  	tone: args.tone,
	  	model: args.model ?? "gpt-5.6-sol",
	  	researchId: research.id,
	  	organizationId,
	  });

  return article;
};

/**
 * ACTION: Delete an SEO Article by ID (with workspace ownership verification)
 */

export const deleteSEOArticle = async(
	args: { articleId: string },
	context: any 
)  => {
	if(!context.user) {
		throw new Error('Not authenticated');
	}

	const organizationId = context.user.activeOrganizationId;
	if(!organizationId) {
		throw new Error("No active workspace selected");
	}

	const article = await context.entities.SEOArticle.findUnique({
		where: { id: args.articleId }
	});

	if(!article) {
		throw new Error("Article not found");
	}

	if(article.organizationId !== organizationId) {
		throw new Error('Unauthorized to delete this article');
	}

	return context.entities.SEOArticle.delete({
		where: { id: args.articleId },
	});
}

export const getSEOArticle = async (
	{ id } : { id: string},
	context: any
) => {
	if(!context.user) {
		throw new Error("Not authenticated");
	}

	const organizationId = context.user.activeOrganizationId;

	if(!organizationId) {
		throw new Error("No active organization");
	}

	const article = await context.entities.SEOArticle.findFirst({
		where: {
			id,
			organizationId,
		},
		include: {
			keyword: true,
		},
	});

	if(!article) {
		throw new Error("Article not found");
	}


	return article;
}

export const updateSEOArticle = async (
	{
		id,
		title,
		metaTitle,
		metaDescription,
		slug,
		content
	}: {
		id: string;
		title: string;
		metaTitle: string;
		metaDescription: string;
		slug: string;
		content: string;
	}
	,
	context: any
) => {
	if(!context.user) {
		throw new Error("Not authenticated");
	}

	const organizationId = context.user.activeOrganizationId;

	if(!organizationId) {
		throw new Error("No active organization");
	}

	const article = await context.entities.SEOArticle.findFirst({
		where: {
			id,
			organizationId,
		},
	});

	if(!article) {
		throw new Error("Article not found");
	}

	const wordCount = content
			.replace(/[#>*_`~[\]()]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.split(' ')
			.filter(Boolean).length;


	return context.entities.SEOArticle.update({
		where: {
			id,
		},
		data: {
			title,
			metaTitle,
			metaDescription,
			slug,
			content,
			wordCount,
		},
	});
}

export const getRandomGSCKeyword = async (_args: void, context: any) => {
  if (!context.user) {
    throw new Error('Not authenticated');
  }

  const organizationId = context.user.activeOrganizationId;

  if (!organizationId) {
    throw new Error('No active workspace selected');
  }

  const rows = await context.entities.GSCQuery.findMany({
    where: {
      import: {
        organizationId,
      },
    },
    select: {
      query: true,
    },
    take: 100,
  });

  if (rows.length === 0) {
    return null;
  }

  return rows[Math.floor(Math.random() * rows.length)].query;
};