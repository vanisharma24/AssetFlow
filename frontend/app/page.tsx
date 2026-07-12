import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Logos from "./components/Logos";
import WhyChoose from "./components/WhyChoose";
import AIFeatures from "./components/AIFeatures";
import CoreFeatures from "./components/CoreFeatures";
import Analytics from "./components/Analytics";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FooterCTA from "./components/FooterCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Logos />
        <WhyChoose />
        <AIFeatures />
        <CoreFeatures />
        <Analytics />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />
    </>
  );
}
