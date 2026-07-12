import Navbar from "./components/Navbar";
import DashboardShell from "./components/DashboardShell";
import Hero from "./components/Hero";
import Logos from "./components/Logos";
import WhyChoose from "./components/WhyChoose";
import Analytics from "./components/Analytics";
import AIFeatures from "./components/AIFeatures";
import CoreFeatures from "./components/CoreFeatures";
import Modules from "./components/Modules";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FooterCTA from "./components/FooterCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.04),_transparent_35%)]">
        <DashboardShell />
      <main className="flex-1">
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
    </>
  );
}
