import { Suspense } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'

export default function DashboardGroupLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-theme flex min-h-screen bg-[#09090b] text-slate-100">
      <Suspense fallback={<div className="w-64 shrink-0 border-r border-slate-900 bg-[#0c0c0e]" />}>
        <DashboardSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
