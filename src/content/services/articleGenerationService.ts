import type { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { env } from "wasp/server";

import {
  calculateArticleWdfIdf,
  type WdfIdfTerm,
} from "../../seo/utils/wdfidf";

const openAi = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const googleAi = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

type RecommendedHeading = {
  level?: string;
  title: string;
};

interface GenerateArticleInput {
  targetKeyword: string;
  tone?: string;
  model: string;
  contentGaps: string[];
  recommendedOutline: RecommendedHeading[];
  competitorWdfIdf: WdfIdfTerm[];
}

export async function generateArticleContent({
  targetKeyword,
  tone,
  model,
  contentGaps,
  recommendedOutline,
  competitorWdfIdf,
}: GenerateArticleInput) {
  const targetWordCount = 2000;

  let articleTitle =
    `${targetKeyword.charAt(0).toUpperCase() + targetKeyword.slice(1)}: The Complete Guide`;

  let metaTitle = articleTitle;
  let metaDescription = `Comprehensive guide covering ${targetKeyword}.`;
  let markdownContent = "";

  const prompt = `
You are an expert SEO copywriter. Write a comprehensive, long-form
Markdown blog post targeting the keyword: "${targetKeyword}".

Tone of Voice: ${tone || "Professional"}
Target Word Count: ~${targetWordCount} words

Competitor Content Topics to Cover:
${contentGaps.map((topic, i) => `${i + 1}. ${topic}`).join("\n")}

Recommended Heading Outline:
${recommendedOutline
  .map((h) => `- ${h.level?.toUpperCase() || "H2"}: ${h.title}`)
  .join("\n")}

Instructions:
1. Write a clean Markdown document starting with an H1 title.
2. Address all competitor topics thoroughly.
3. Return ONLY the Markdown content.
`;

  try {
    const isGemini =
      model === "gemini-3.6-flash" ||
      model === "gemini-3.8-flash";

    const ai = isGemini ? googleAi : openAi;

    const completion = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert SEO content generator.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1.0,
    });

    const rawContent =
      completion.choices[0]?.message?.content || "";

    markdownContent = rawContent
      .replace(/^```(?:markdown)?\s*\n?/i, "")
      .replace(/\n?\s*```$/i, "")
      .trim();

    const firstH1 = markdownContent.match(/^#\s+(.+)$/m);

    if (firstH1) {
      articleTitle = firstH1[1].trim();
      metaTitle = `${articleTitle.slice(0, 55)} | BoomSEO`;
    }

    metaDescription =
      `Learn everything about ${targetKeyword}. In-depth guide covering key strategies and competitor insights.`
        .slice(0, 155);

  } catch (error) {
    console.warn("AI article generation failed:", error);

    // Preserve your existing fallback behavior.
    markdownContent =
      `# ${articleTitle}\n\n## Competitor Topics\n\n` +
      contentGaps.map((gap) => `- ${gap}`).join("\n");
  }

  const wordCount = markdownContent.trim().split(/\s+/).length;

  const slug = targetKeyword
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // WDF-IDF analysis
  const articleWdfIdf = calculateArticleWdfIdf(
    markdownContent,
    competitorWdfIdf
  );

  const wdfIdfAnalysis: Prisma.InputJsonValue = {
    terms: articleWdfIdf.map((row) => ({
      term: row.term,
      articleWeight: row.articleWeight,
      competitorAverage: row.competitorAverage,
      difference: row.difference,
      competitors: row.competitors,
    })),
  };

  const contentBrief: Prisma.InputJsonValue = {
    contentGaps,
    outline: recommendedOutline,
  };

  return {
    title: articleTitle,
    metaTitle,
    metaDescription,
    slug,
    content: markdownContent,
    wordCount,
    wdfIdfAnalysis,
    contentBrief,
  };
}