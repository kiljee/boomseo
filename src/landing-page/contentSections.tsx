import { BlogUrl, DocsUrl } from "../shared/common";
import { routes } from "wasp/client/router";
import type { GridFeature } from "./components/FeaturesGrid";

export const features: GridFeature[] = [
  {
    name: "Website SEO Analysis",
    description:
      "Analyze your website to build SEO context and uncover issues and opportunities that can guide your optimization work.",
    emoji: "🌐",
    href: "#workflow",
    size: "medium",
  },
  {
    name: "Keyword & SERP Research",
    description:
      "Research target keywords, explore search results, and identify relevant competing pages for further analysis.",
    emoji: "🔍",
    href: "#workflow",
    size: "medium",
  },
  {
    name: "Competitor Content Analysis",
    description:
      "Crawl competitor pages and examine their content, headings, and relevant terms to better understand the competition.",
    emoji: "⚔️",
    href: "#workflow",
    size: "large",
  },
  {
    name: "WDF-IDF Analyzer",
    description:
      "Compare your article's term usage against competitor content and identify missing, underused, and overused terms.",
    emoji: "📊",
    href: "#content-optimization",
    size: "large",
  },
  {
    name: "AI Article Optimization",
    description:
      "Use targeted content recommendations to improve existing articles while keeping their original purpose and meaning.",
    emoji: "✨",
    href: "#content-optimization",
    size: "large",
  },
  {
    name: "AI Article Generation",
    description:
      "Create SEO-focused article drafts using keyword research, competitor insights, and your chosen content context.",
    emoji: "✍️",
    href: "#features",
    size: "medium",
  },
  {
    name: "SEO Workspace",
    description:
      "Organize your website, target market, language, SEO preferences, and research in a dedicated workspace.",
    emoji: "🗂️",
    href: "#features",
    size: "medium",
  },
];

export const faqs = [
  {
    id: 1,
    question: "What is BoomSEO?",
    answer:
      "BoomSEO is an SEO research and content optimization platform. It brings together keyword research, competitor content analysis, WDF-IDF analysis, and AI-assisted article generation and optimization.",
    href: "#features",
  },
  {
    id: 2,
    question: "What is WDF-IDF analysis?",
    answer:
      "WDF-IDF is a method of evaluating how relevant terms are used in a document. BoomSEO uses competitor content as a reference to help identify terms that may be missing, underused, or overused in your article.",
    href: "#content-optimization",
  },
  {
    id: 3,
    question: "How does competitor analysis work?",
    answer:
      "You research a target keyword and use relevant search results to identify competitor pages. BoomSEO analyzes the available page content and uses it as a reference for content research and optimization.",
    href: "#workflow",
  },
  {
    id: 4,
    question: "Can BoomSEO optimize an article I've already written?",
    answer:
      "Yes. You can provide an existing article for WDF-IDF analysis, review its content recommendations, and use AI assistance to improve the draft.",
    href: "#content-optimization",
  },
  {
    id: 5,
    question: "Does BoomSEO guarantee higher Google rankings?",
    answer:
      "No SEO tool can guarantee rankings. BoomSEO helps you make more informed content decisions using research and analysis, but results also depend on competition, technical SEO, backlinks, search intent, and other factors.",
    href: "#features",
  },
  {
    id: 6,
    question: "Do I need technical SEO experience?",
    answer:
      "No. BoomSEO is designed to make keyword and competitor research more accessible, while presenting content analysis in a way that can help guide your next optimization steps.",
    href: "#workflow",
  },
];

export const footerNavigation = {
  app: [
    { name: "Features", href: "#features" },
    { name: "How it works", href: "#workflow" },
    { name: "Documentation", href: DocsUrl },
    { name: "Pricing", href: routes.PricingPageRoute.to },
    { name: "Blog", href: BlogUrl },
  ],
  company: [],
};