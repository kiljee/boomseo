import { ExamplesCarousel } from "./components/ExamplesCarousel";
import { FAQ } from "./components/FAQ";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { Testimonials } from "./components/Testimonials";
import {
  examples,
  faqs,
  features,
  footerNavigation,
  testimonials,
} from "./contentSections";
import { AIReady } from "./ExampleHighlightedFeature";
import { useAuth } from "wasp/client/auth";
import { useNavigate } from "react-router";
import { useEffect } from 'react'
import { routes } from "wasp/client/router";

export function LandingPage() {
  const { data: user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(user) {
      //navigate(routes.WorkspacesRoute.to);
    }
  }, [user]);


  if(isLoading)
    return null;

  return (
    <div className="bg-background text-foreground">
      <SchemaMarkup />
      <main className="isolate">
        <Hero />
        <ExamplesCarousel examples={examples} />
        <AIReady />
        <FeaturesGrid features={features} />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
