"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
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
import AuthSection from "./components/AuthSection";
import DashboardShell from "./components/DashboardShell";

export default function Home() {
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    // Set initial hash
    setHash(window.location.hash);

    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Listen for login/logout custom event to redirect appropriately
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("assetflow_token");
      if (token) {
        window.location.hash = "#dashboard";
      } else {
        window.location.hash = "#auth";
      }
    };

    window.addEventListener("assetflow-auth", handleAuthChange);
    return () => {
      window.removeEventListener("assetflow-auth", handleAuthChange);
    };
  }, []);

  // Before client hydration check
  if (hash === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("assetflow_token") : null;

  if (hash === "#dashboard") {
    if (!token) {
      // Not authenticated, redirect to #auth
      if (typeof window !== "undefined") {
        window.location.hash = "#auth";
      }
      return null;
    }
    return <DashboardShell />;
  }

  if (hash === "#auth") {
    if (token) {
      // Already authenticated, redirect to #dashboard
      if (typeof window !== "undefined") {
        window.location.hash = "#dashboard";
      }
      return null;
    }
    return <AuthSection />;
  }

  // Render landing page
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.04),_transparent_35%)]">
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
