'use client'

import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type KpiSummary = {
  totalAssets: number
  activeAllocations: {
    total: number
    employee: number
    department: number
  }
  overdueAllocations: number
  pendingMaintenance: number
}

export default function DashboardShell() {
  const [kpis, setKpis] = useState<KpiSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadKpis = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/kpis`)
        if (!response.ok) throw new Error('Could not load dashboard metrics')
        const data = await response.json()
        setKpis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    loadKpis()
  }, [])

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-16 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Operations dashboard</p>
          <h2 className="text-3xl font-semibold text-slate-900">AssetFlow control center</h2>
          <p className="mt-2 text-sm text-slate-600">Track asset health, allocations, and maintenance in one place.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Connected to backend KPIs
        </div>
      </div>

      {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading dashboard metrics…</div>}
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>}

      {kpis && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total assets" value={kpis.totalAssets} tone="blue" />
          <MetricCard label="Active allocations" value={kpis.activeAllocations.total} tone="green" />
          <MetricCard label="Overdue allocations" value={kpis.overdueAllocations} tone="amber" />
          <MetricCard label="Pending maintenance" value={kpis.pendingMaintenance} tone="rose" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Allocation overview</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Employee-held</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{kpis?.activeAllocations.employee ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Department-held</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{kpis?.activeAllocations.department ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <h3 className="text-lg font-semibold">Operational focus</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li>• Review overdue handovers</li>
            <li>• Approve maintenance requests</li>
            <li>• Plan department asset distribution</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'green' | 'amber' | 'rose' }) {
  const tones = {
    blue: 'bg-sky-50 text-sky-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
