const SITE_URL = "https://your-production-domain.com";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "BoomSEO",
      description:
        "SEO research and content optimization platform for keyword research, competitor content analysis, WDF-IDF analysis, and AI-assisted article generation and optimization.",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "SEO Software",
      operatingSystem: "Web",
      featureList: [
        "Website SEO analysis",
        "Keyword and SERP research",
        "Competitor content analysis",
        "WDF-IDF content analysis",
        "AI-assisted article optimization",
        "AI-assisted article generation",
        "SEO workspace management",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "BoomSEO",
      description:
        "Research keywords, analyze competing content, and optimize SEO articles with WDF-IDF insights and AI assistance.",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "BoomSEO",
      url: SITE_URL,
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