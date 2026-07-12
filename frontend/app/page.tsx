<<<<<<< Updated upstream
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
      </main>
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
=======
'use client'

import { useEffect, useState } from 'react'
import DashboardShell from './components/DashboardShell'
import AuthSection from './components/AuthSection'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('assetflow_token')
      setIsAuthenticated(!!token)
      setLoading(false)
    }
    
    // Check auth on load
    checkAuth()

    // Setup event listeners for storage and custom events
    window.addEventListener('assetflow-auth', checkAuth)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('assetflow-auth', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs tracking-wider text-slate-400">Loading AssetFlow...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthSection />
  }

  return <DashboardShell />
>>>>>>> Stashed changes
}
