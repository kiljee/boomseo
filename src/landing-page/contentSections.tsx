import daBoiAvatar from "../client/static/da-boi.webp";
import kivo from "../client/static/examples/kivo.webp";
import messync from "../client/static/examples/messync.webp";
import microinfluencerClub from "../client/static/examples/microinfluencers.webp";
import promptpanda from "../client/static/examples/promptpanda.webp";
import reviewradar from "../client/static/examples/reviewradar.webp";
import scribeist from "../client/static/examples/scribeist.webp";
import searchcraft from "../client/static/examples/searchcraft.webp";
import { BlogUrl, DocsUrl } from "../shared/common";
import type { GridFeature } from "./components/FeaturesGrid";
export const features: GridFeature[] = [
  {
    name: "Keyword Research",
    description: "Find high-volume, low-competition keywords to grow your organic traffic.",
    emoji: "🔍",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Site Audit",
    description: "Detect broken links, missing metadata, crawl issues, and technical SEO problems.",
    emoji: "🩺",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Rank Tracking",
    description: "Monitor keyword rankings across search engines and receive daily updates.",
    emoji: "📈",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Content Optimizer",
    description: "Get AI-powered suggestions to improve readability, keyword coverage, and search intent.",
    emoji: "✍️",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "Competitor Analysis",
    description: "See which keywords your competitors rank for and uncover new opportunities.",
    emoji: "⚔️",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "Backlink Monitoring",
    description: "Track backlinks, discover new referring domains, and monitor lost links.",
    emoji: "🔗",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "SEO Reports",
    description: "Generate beautiful reports for clients or your team in just one click.",
    emoji: "📊",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "AI Recommendations",
    description: "Receive actionable recommendations prioritized by potential SEO impact.",
    emoji: "🤖",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Performance Dashboard",
    description: "Track organic traffic, visibility, and SEO health from a single dashboard.",
    emoji: "🚀",
    href: DocsUrl,
    size: "medium",
  },
];

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "SEO Consultant",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote:
      "This tool cut my keyword research time in half and helped several clients reach the first page of Google.",
  },
  {
    name: "Michael Torres",
    role: "Marketing Manager",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote:
      "The automated site audits helped us fix dozens of SEO issues before they impacted our rankings.",
  },
  {
    name: "Emily Johnson",
    role: "E-commerce Founder",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote:
      "Our organic traffic increased by over 40% after following the platform's optimization suggestions.",
  },
];

export const faqs = [
  {
    id: 1,
    question: "Do I need SEO experience to use the platform?",
    answer:
      "No. Our AI explains every issue in plain language and provides step-by-step recommendations.",
    href: "#",
  },
  {
    id: 2,
    question: "Can I track multiple websites?",
    answer:
      "Yes. Depending on your subscription, you can monitor one or hundreds of websites from a single dashboard.",
    href: "#",
  },
  {
    id: 3,
    question: "How often are rankings updated?",
    answer:
      "Keyword rankings are updated daily, giving you an accurate picture of your SEO performance.",
    href: "#",
  },
];

export const footerNavigation = {
  app: [
    { name: "Documentation", href: DocsUrl },
    { name: "API", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Blog", href: BlogUrl },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

export const examples = [
  {
    name: "Local Business SEO",
    description: "Track rankings and optimize your Google Business presence.",
    imageSrc: kivo,
    href: "#",
  },
  {
    name: "E-commerce SEO",
    description: "Optimize thousands of product pages for organic search.",
    imageSrc: messync,
    href: "#",
  },
  {
    name: "Agency Dashboard",
    description: "Manage SEO campaigns for multiple clients from one workspace.",
    imageSrc: microinfluencerClub,
    href: "#",
  },
  {
    name: "Content Optimization",
    description: "Improve blog posts with AI-powered SEO recommendations.",
    imageSrc: promptpanda,
    href: "#",
  },
  {
    name: "Technical SEO Audit",
    description: "Automatically detect crawl errors, redirects, and broken pages.",
    imageSrc: reviewradar,
    href: "#",
  },
  {
    name: "Competitor Insights",
    description: "Compare rankings and uncover keyword gaps between competitors.",
    imageSrc: scribeist,
    href: "#",
  },
  {
    name: "SEO Analytics",
    description: "Monitor traffic, rankings, and visibility from a unified dashboard.",
    imageSrc: searchcraft,
    href: "#",
  },
];