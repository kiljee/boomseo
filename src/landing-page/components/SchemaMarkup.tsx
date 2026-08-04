// JSON-LD structured data for SEO. Helps search engines and LLMs understand
// your app so it can appear in rich results and AI answers. Customize the
// placeholders below to match your product. See https://schema.org for types.
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://your-domain.com/#software",
      name: "BoomSEO", // Replace with your app name
      description:
        "AI-powered SEO platform for keyword research, site audits, rank tracking, backlink monitoring, and on-page optimization.",
      url: "https://your-domain.com",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "SEO Software",
      operatingSystem: "Web",
      image: "https://your-domain.com/og-image.webp",
      featureList: [
        "Keyword research",
        "Website SEO audits",
        "Rank tracking",
        "Backlink analysis",
        "On-page optimization",
        "AI SEO recommendations",
        "Competitor analysis",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Organization",
        name: "Your Company",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://your-domain.com/#website",
      url: "https://your-domain.com",
      name: "SEOFlow",
      description:
        "AI-powered SEO platform to improve search rankings, analyze websites, and grow organic traffic.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://your-domain.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://your-domain.com/#organization",
      name: "Your Company",
      url: "https://your-domain.com",
      logo: "https://your-domain.com/logo.png",
    },
  ],
};

export function SchemaMarkup() {
  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
}