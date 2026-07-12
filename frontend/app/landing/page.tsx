import type { Metadata } from "next";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Logos from "../components/Logos";
import WhyChoose from "../components/WhyChoose";
import Analytics from "../components/Analytics";
import AIFeatures from "../components/AIFeatures";
import CoreFeatures from "../components/CoreFeatures";
import Modules from "../components/Modules";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import FooterCTA from "../components/FooterCTA";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "AssetFlow — Enterprise Asset Management",
  description:
    "AssetFlow centralizes asset tracking, resource booking, maintenance workflows, and audit management into one intelligent ERP platform.",
};

export default function LandingPage() {
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
