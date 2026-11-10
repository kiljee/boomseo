import { FAQ } from "./components/FAQ";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { ProductShowcase } from "./components/ProductShowcase";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { faqs, features, footerNavigation } from "./contentSections";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SchemaMarkup />

      <main className="isolate">
        <Hero />
        <ProductShowcase />
        <FeaturesGrid features={features} />
        <FAQ faqs={faqs} />
      </main>

      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}