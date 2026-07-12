import Navbar from "./Navbar";
import Hero from "./Hero";
import Logos from "./Logos";
import WhyChoose from "./WhyChoose";
import Analytics from "./Analytics";
import AIFeatures from "./AIFeatures";
import CoreFeatures from "./CoreFeatures";
import Modules from "./Modules";
import Testimonials from "./Testimonials";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import FooterCTA from "./FooterCTA";
import Footer from "./Footer";

/** Public marketing landing — shared by `/` (logged-out) and `/landing`. */
export default function LandingView() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <Hero />
        <Logos />
        <WhyChoose />
        <Analytics />
        <AIFeatures />
        <CoreFeatures />
        <Modules />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />
    </div>
  );
}
