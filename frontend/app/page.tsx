'use client'

import { Suspense, useEffect, useState } from 'react'
import DashboardShell from './components/DashboardShell'
import LandingView from './components/LandingView'

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs tracking-wider text-slate-500">Loading AssetFlow...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingView />
  }

  return (
    <Suspense fallback={null}>
      <DashboardShell />
    </Suspense>
  )
}
