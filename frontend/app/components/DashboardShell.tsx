'use client'

import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  LogOut,
  Search,
  Plus,
  Calendar,
  AlertTriangle,
  User,
  Filter,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'
import {
  RegisterAssetModal,
  BookResourceModal,
  RaiseRequestsModal
} from './DashboardModals'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Kpis = {
  availableAssets: number
  allocatedAssets: number
  bookableAvailableAssets: number
  activeBookings: number
  pendingTransfers: number
  upcomingReturns: number
  overdueAllocations: number
  pendingMaintenance: number
  activities: string[]
}

type UserProfile = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export default function DashboardShell() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [loadingKpis, setLoadingKpis] = useState(true)
  const [kpiError, setKpiError] = useState('')

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isBookOpen, setIsBookOpen] = useState(false)
  const [isRequestOpen, setIsRequestOpen] = useState(false)

  // Sub-tabs data state
  const [assets, setAssets] = useState<any[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [allocations, setAllocations] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])
  const [loadingAllocations, setLoadingAllocations] = useState(false)

  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  const [maintenances, setMaintenances] = useState<any[]>([])
  const [loadingMaintenances, setLoadingMaintenances] = useState(false)

  const [departments, setDepartments] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loadingOrg, setLoadingOrg] = useState(false)

  // Load Current User
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('assetflow_token')
        if (!token) return
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentUser(data.user)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchUser()
  }, [])

  // Load KPIs
  const loadKpis = async () => {
    setLoadingKpis(true)
    setKpiError('')
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/kpis`)
      if (!res.ok) throw new Error('Failed to load dashboard metrics')
      const data = await res.json()
      setKpis(data)
    } catch (err: any) {
      setKpiError(err.message)
    } finally {
      setLoadingKpis(false)
    }
  }

  useEffect(() => {
    loadKpis()
  }, [])

  // Load active tab data
  useEffect(() => {
    if (activeTab === 'assets') {
      fetchAssets()
    } else if (activeTab === 'allocation') {
      fetchAllocationsAndTransfers()
    } else if (activeTab === 'booking') {
      fetchBookings()
    } else if (activeTab === 'maintenance') {
      fetchMaintenances()
    } else if (activeTab === 'organization') {
      fetchOrgData()
    }
  }, [activeTab, searchQuery, statusFilter])

  // Actions fetchers
  const fetchAssets = async () => {
    setLoadingAssets(true)
    try {
      let url = `${API_BASE}/api/assets`
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      if (res.ok) setAssets(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAssets(false)
    }
  }

  const fetchAllocationsAndTransfers = async () => {
    setLoadingAllocations(true)
    try {
      const [resAlloc, resTrans] = await Promise.all([
        fetch(`${API_BASE}/api/allocations`),
        fetch(`${API_BASE}/api/transfers`)
      ])
      if (resAlloc.ok) setAllocations(await resAlloc.json())
      if (resTrans.ok) setTransfers(await resTrans.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAllocations(false)
    }
  }

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await fetch(`${API_BASE}/api/bookings`)
      if (res.ok) setBookings(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingBookings(false)
    }
  }

  const fetchMaintenances = async () => {
    setLoadingMaintenances(true)
    try {
      const res = await fetch(`${API_BASE}/api/maintenances`)
      if (res.ok) setMaintenances(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMaintenances(false)
    }
  }

  const fetchOrgData = async () => {
    setLoadingOrg(true)
    try {
      const [resDept, resEmp] = await Promise.all([
        fetch(`${API_BASE}/api/departments`),
        fetch(`${API_BASE}/api/employees`)
      ])
      if (resDept.ok) setDepartments(await resDept.json())
      if (resEmp.ok) setEmployees(await resEmp.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOrg(false)
    }
  }

  // Handle Return Asset
  const handleReturnAsset = async (allocationId: string) => {
    const notes = prompt('Enter return condition notes (e.g. Excellent condition):', 'Returned in good working order')
    if (notes === null) return // cancelled
    if (!notes.trim()) {
      alert('Return notes are required.')
      return
    }

    try {
      const token = localStorage.getItem('assetflow_token')
      const res = await fetch(`${API_BASE}/api/allocations/${allocationId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ returnConditionNotes: notes })
      })

      if (res.ok) {
        alert('Asset returned successfully!')
        loadKpis()
        fetchAllocationsAndTransfers()
      } else {
        const err = await res.json()
        alert(`Failed to return asset: ${err.error}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Approve Transfer
  const handleApproveTransfer = async (transferId: string) => {
    if (!currentUser) {
      alert('You must be signed in to approve transfers.')
      return
    }

    if (!confirm('Are you sure you want to approve this transfer request?')) return

    try {
      const token = localStorage.getItem('assetflow_token')
      const res = await fetch(`${API_BASE}/api/transfers/${transferId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approvedBy: currentUser.id })
      })

      if (res.ok) {
        alert('Transfer approved successfully!')
        loadKpis()
        fetchAllocationsAndTransfers()
      } else {
        const err = await res.json()
        alert(`Failed to approve transfer: ${err.error}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const token = localStorage.getItem('assetflow_token')
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        alert('Booking cancelled successfully!')
        loadKpis()
        fetchBookings()
      } else {
        const err = await res.json()
        alert(`Failed to cancel booking: ${err.error}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Approve Maintenance
  const handleApproveMaintenance = async (reqId: string) => {
    if (!confirm('Are you sure you want to approve this maintenance request? This will mark the asset as Under Maintenance.')) return

    try {
      const token = localStorage.getItem('assetflow_token')
      const res = await fetch(`${API_BASE}/api/maintenances/${reqId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        alert('Maintenance approved successfully!')
        loadKpis()
        fetchMaintenances()
      } else {
        const err = await res.json()
        alert(`Failed to approve maintenance: ${err.error}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Resolve Maintenance
  const handleResolveMaintenance = async (reqId: string) => {
    if (!confirm('Are you sure you want to mark this maintenance request as resolved?')) return

    try {
      const token = localStorage.getItem('assetflow_token')
      const res = await fetch(`${API_BASE}/api/maintenances/${reqId}/resolve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        alert('Maintenance resolved successfully!')
        loadKpis()
        fetchMaintenances()
      } else {
        const err = await res.json()
        alert(`Failed to resolve maintenance: ${err.error}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Update Employee (Promotions, Departments, Status)
  const handleUpdateEmployee = async (employeeId: string, fields: { name?: string; role?: string; departmentId?: string; status?: string }) => {
    try {
      const token = localStorage.getItem('assetflow_token')
      const res = await fetch(`${API_BASE}/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      })

      if (res.ok) {
        alert('Employee updated successfully!')
        fetchOrgData()
      } else {
        const err = await res.json()
        alert(`Failed to update employee: ${err.error}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('assetflow_token')
    window.dispatchEvent(new Event('assetflow-auth'))
  }

  const refreshDashboard = () => {
    loadKpis()
    if (activeTab === 'assets') fetchAssets()
    if (activeTab === 'allocation') fetchAllocationsAndTransfers()
    if (activeTab === 'booking') fetchBookings()
    if (activeTab === 'maintenance') fetchMaintenances()
  }

  // Nav menu helper
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'organization', name: 'Organization setup', icon: Building2 },
    { id: 'assets', name: 'Assets', icon: Package },
    { id: 'allocation', name: 'Allocation & Transfer', icon: ArrowLeftRight },
    { id: 'booking', name: 'Resource Booking', icon: CalendarDays },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
    { id: 'audit', name: 'Audit', icon: ClipboardCheck },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-slate-900 bg-[#0c0c0e] px-4 py-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-3 mb-8">
            <div className="h-7 w-7 rounded bg-emerald-500 text-[#09090b] flex items-center justify-center font-bold text-sm">
              AF
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AssetFlow</span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSearchQuery('')
                    setStatusFilter('')
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive
                      ? 'border border-emerald-500/50 text-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Block at bottom */}
        {currentUser && (
          <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-semibold text-xs border border-slate-700">
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/5 transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {sidebarItems.find(item => item.id === activeTab)?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Asset tracking, booking and maintenance operations center.
            </p>
          </div>

          {/* Profile Avatars - S, H */}
          <div className="flex items-center gap-1.5">
            <div className="h-9 w-9 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-xs shadow-md border border-[#4f46e5]">
              S
            </div>
            <div className="h-9 w-9 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-xs shadow-md border border-[#7c3aed]">
              H
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold tracking-wide text-slate-300">Today's Overview</h2>

            {loadingKpis ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl border border-slate-900 bg-[#0f0f11] animate-pulse" />
                ))}
              </div>
            ) : kpiError ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
                {kpiError}
              </div>
            ) : kpis ? (
              <>
                {/* Metrics Row 1 */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-emerald-500/40 opacity-0 group-hover:opacity-100 transition" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Available</p>
                    <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">{kpis.availableAssets}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Total items ready for assignment</p>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-blue-500/40 opacity-0 group-hover:opacity-100 transition" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Allocated</p>
                    <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">{kpis.allocatedAssets}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Items currently held by staff/depts</p>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-cyan-500/40 opacity-0 group-hover:opacity-100 transition" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Available (Bookable)</p>
                    <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">{kpis.bookableAvailableAssets}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Bookable rooms and accessories</p>
                  </div>
                </div>

                {/* Metrics Row 2 */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-purple-500/40 opacity-0 group-hover:opacity-100 transition" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Bookings</p>
                    <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">{kpis.activeBookings}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Ongoing or upcoming room rentals</p>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-rose-500/40 opacity-0 group-hover:opacity-100 transition" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Transfers</p>
                    <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">{kpis.pendingTransfers}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Handovers requiring manager signoff</p>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-amber-500/40 opacity-0 group-hover:opacity-100 transition" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Upcoming Returns</p>
                    <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">{kpis.upcomingReturns}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Allocations due to return soon</p>
                  </div>
                </div>

                {/* Overdue Returns Alert Banner */}
                {kpis.overdueAllocations > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-900/60 bg-[#251214] p-4 text-sm text-rose-400 shadow-md">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                    <span>
                      <strong>{kpis.overdueAllocations} assets overdue for return</strong> - flagged for follow-up
                    </span>
                  </div>
                )}
              </>
            ) : null}

            {/* Quick Actions Panel */}
            <div className="grid gap-3 sm:grid-cols-3">
              {currentUser?.role === 'Admin' || currentUser?.role === 'AssetManager' ? (
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 transition shadow-[0_0_10px_rgba(16,185,129,0.02)]"
                >
                  <Plus className="h-4 w-4" />
                  + register asset
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-950/20 px-4 py-3 text-sm font-semibold text-slate-600 cursor-not-allowed select-none">
                  <Plus className="h-4 w-4 text-slate-700" />
                  + register asset (Managers only)
                </div>
              )}
              <button
                onClick={() => setIsBookOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/5 px-4 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition"
              >
                <Calendar className="h-4 w-4" />
                Book resource
              </button>
              <button
                onClick={() => setIsRequestOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 transition"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Raise requests
              </button>
            </div>

            {/* Recent Activity Section */}
            <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-6">
              <h3 className="text-base font-semibold text-slate-300 mb-4">Recent Activity</h3>
              {loadingKpis ? (
                <div className="space-y-2">
                  <div className="h-4 bg-slate-900 animate-pulse w-3/4 rounded" />
                  <div className="h-4 bg-slate-900 animate-pulse w-2/3 rounded" />
                  <div className="h-4 bg-slate-900 animate-pulse w-1/2 rounded" />
                </div>
              ) : kpis && kpis.activities.length > 0 ? (
                <ul className="space-y-3">
                  {kpis.activities.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No recent activity found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search and filter toolbar */}
              <div className="flex items-center gap-2 w-full sm:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-900 bg-[#0f0f11] pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition"
                    placeholder="Search name, serial number, tag..."
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-900 bg-[#0f0f11] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition"
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Under_Maintenance">In Maintenance</option>
                </select>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-[#09090b] font-semibold text-sm hover:bg-emerald-400 transition"
              >
                + Register Asset
              </button>
            </div>

            {loadingAssets ? (
              <p className="text-slate-400 text-sm">Loading assets...</p>
            ) : assets.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#0f0f11]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-medium bg-[#09090b]/50">
                      <th className="p-4">Asset Tag</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Bookable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {assets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-900/20 text-slate-300">
                        <td className="p-4 font-mono font-semibold text-emerald-400">{asset.assetTag}</td>
                        <td className="p-4 text-white font-medium">{asset.name}</td>
                        <td className="p-4 text-slate-400">{asset.category?.name || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                            asset.status === 'Available' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                            asset.status === 'Allocated' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' :
                            asset.status === 'Reserved' ? 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20' :
                            'bg-amber-500/5 text-amber-400 border-amber-500/20'
                          }`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">{asset.condition}</td>
                        <td className="p-4 text-slate-400">{asset.location}</td>
                        <td className="p-4 font-mono text-xs">{asset.isBookable ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No assets found matching the criteria.</p>
            )}
          </div>
        )}

        {activeTab === 'allocation' && (
          <div className="space-y-8">
            {/* Active Allocations section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-300">Active Allocations</h3>
              {loadingAllocations ? (
                <p className="text-slate-400 text-sm">Loading allocations...</p>
              ) : allocations.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#0f0f11]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-medium bg-[#09090b]/50">
                        <th className="p-4">Asset</th>
                        <th className="p-4">Holder Type</th>
                        <th className="p-4">Assigned To</th>
                        <th className="p-4">Allocated At</th>
                        <th className="p-4">Expected Return</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {allocations
                        .filter(a => a.status === 'Active')
                        .map(alloc => {
                          const holder = alloc.holderType === 'Employee' ? alloc.employee?.name : alloc.department?.name
                          const email = alloc.employee ? `(${alloc.employee.email})` : ''
                          const isOverdue = new Date(alloc.expectedReturnDate) < new Date()
                          return (
                            <tr key={alloc.id} className="hover:bg-slate-900/20 text-slate-300">
                              <td className="p-4">
                                <span className="font-mono text-emerald-400 mr-2 font-semibold">{alloc.asset.assetTag}</span>
                                {alloc.asset.name}
                              </td>
                              <td className="p-4 text-slate-400">{alloc.holderType}</td>
                              <td className="p-4 text-white">
                                {holder} <span className="text-xs text-slate-500">{email}</span>
                              </td>
                              <td className="p-4 text-slate-400">{new Date(alloc.allocatedAt).toLocaleDateString()}</td>
                              <td className="p-4 text-slate-400">{new Date(alloc.expectedReturnDate).toLocaleDateString()}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                                  isOverdue
                                    ? 'bg-rose-500/5 text-rose-400 border-rose-500/20 animate-pulse'
                                    : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {isOverdue ? 'Overdue' : 'Active'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleReturnAsset(alloc.id)}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-white transition"
                                >
                                  Return Asset
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">No active allocations.</p>
              )}
            </div>

            {/* Pending Transfer Requests */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-300">Pending Transfer Requests</h3>
              {loadingAllocations ? (
                <p className="text-slate-400 text-sm">Loading transfers...</p>
              ) : transfers.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#0f0f11]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-medium bg-[#09090b]/50">
                        <th className="p-4">Asset ID</th>
                        <th className="p-4">From Holder</th>
                        <th className="p-4">Proposed Recipient</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {transfers
                        .filter(t => t.status === 'Requested')
                        .map(t => (
                          <tr key={t.id} className="hover:bg-slate-900/20 text-slate-300">
                            <td className="p-4 font-mono font-semibold text-emerald-400">{t.assetId}</td>
                            <td className="p-4 text-slate-400">{t.fromHolderId}</td>
                            <td className="p-4 text-white">{t.toHolderId}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center rounded-full bg-rose-500/5 px-2.5 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20">
                                Requested
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleApproveTransfer(t.id)}
                                className="text-xs font-semibold bg-emerald-500 text-[#09090b] px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition"
                              >
                                Approve Handoff
                              </button>
                            </td>
                          </tr>
                        ))}
                      {transfers.filter(t => t.status === 'Requested').length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 italic">No pending transfer requests.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">No transfer requests.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-300">Current Reservations</h3>
              <button
                onClick={() => setIsBookOpen(true)}
                className="rounded-xl bg-cyan-500 px-4 py-2.5 text-[#09090b] font-semibold text-sm hover:bg-cyan-400 transition"
              >
                Book Resource
              </button>
            </div>

            {loadingBookings ? (
              <p className="text-slate-400 text-sm">Loading bookings...</p>
            ) : bookings.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#0f0f11]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-medium bg-[#09090b]/50">
                      <th className="p-4">Asset Tag</th>
                      <th className="p-4">Resource</th>
                      <th className="p-4">Reserved By</th>
                      <th className="p-4">Start Time</th>
                      <th className="p-4">End Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-900/20 text-slate-300">
                        <td className="p-4 font-mono font-semibold text-emerald-400">{booking.asset?.assetTag}</td>
                        <td className="p-4 text-white font-medium">{booking.asset?.name}</td>
                        <td className="p-4 text-slate-400">
                          {booking.user?.name} <span className="text-xs text-slate-500">({booking.user?.email})</span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(booking.startTime).toLocaleString()}</td>
                        <td className="p-4 text-slate-400">{new Date(booking.endTime).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                            booking.status === 'Ongoing' ? 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20' :
                            booking.status === 'Upcoming' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                            booking.status === 'Completed' ? 'bg-slate-500/5 text-slate-400 border-slate-500/20' :
                            'bg-rose-500/5 text-rose-400 border-rose-500/20'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {['Upcoming', 'Ongoing'].includes(booking.status) ? (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-xs font-semibold text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300 transition"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No reservations recorded.</p>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-300">Maintenance Records</h3>
              <button
                onClick={() => setIsRequestOpen(true)}
                className="rounded-xl bg-rose-500 px-4 py-2.5 text-[#09090b] font-semibold text-sm hover:bg-rose-400 transition"
              >
                Raise Request
              </button>
            </div>

            {loadingMaintenances ? (
              <p className="text-slate-400 text-sm">Loading records...</p>
            ) : maintenances.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#0f0f11]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-medium bg-[#09090b]/50">
                      <th className="p-4">Asset Tag</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Issue Description</th>
                      <th className="p-4">Raiser</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {maintenances.map(req => (
                      <tr key={req.id} className="hover:bg-slate-900/20 text-slate-300">
                        <td className="p-4 font-mono font-semibold text-emerald-400">{req.asset?.assetTag}</td>
                        <td className="p-4 text-white font-medium">{req.asset?.name}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                            req.priority === 'Critical' || req.priority === 'High' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' :
                            req.priority === 'Medium' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' :
                            'bg-slate-500/5 text-slate-400 border-slate-500/20'
                          }`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 max-w-xs truncate" title={req.issueDescription}>
                          {req.issueDescription}
                        </td>
                        <td className="p-4 text-slate-400">
                          {req.raiser?.name}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            req.status === 'Resolved' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                            req.status === 'Pending' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20 animate-pulse' :
                            'bg-cyan-500/5 text-cyan-400 border-cyan-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {req.status === 'Pending' && (currentUser?.role === 'Admin' || currentUser?.role === 'AssetManager') && (
                            <button
                              onClick={() => handleApproveMaintenance(req.id)}
                              className="text-xs font-semibold bg-blue-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-400 transition"
                            >
                              Approve
                            </button>
                          )}
                          {req.status === 'Approved' && (currentUser?.role === 'Admin' || currentUser?.role === 'AssetManager') && (
                            <button
                              onClick={() => handleResolveMaintenance(req.id)}
                              className="text-xs font-semibold bg-emerald-500 text-[#09090b] px-2.5 py-1.5 rounded-lg hover:bg-emerald-400 transition"
                            >
                              Resolve
                            </button>
                          )}
                          {req.status === 'Resolved' && (
                            <span className="text-xs text-slate-500">Resolved</span>
                          )}
                          {req.status !== 'Resolved' && !(currentUser?.role === 'Admin' || currentUser?.role === 'AssetManager') && (
                            <span className="text-xs text-slate-500">Waiting for approval</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No maintenance requests raised.</p>
            )}
          </div>
        )}

        {activeTab === 'organization' && (
          <div className="space-y-8">
            {/* Departments */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-300">Registered Departments</h3>
              {loadingOrg ? (
                <p className="text-slate-400 text-sm">Loading organization...</p>
              ) : departments.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {departments.map(dept => (
                    <div key={dept.id} className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-5">
                      <p className="text-sm font-semibold text-white">{dept.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Status: {dept.status}</p>
                      <p className="text-xs text-slate-600 mt-2">Department ID: {dept.id}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">No departments recorded.</p>
              )}
            </div>

            {/* Employees */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-300">Staff Members Directory</h3>
              {loadingOrg ? (
                <p className="text-slate-400 text-sm">Loading staff...</p>
              ) : employees.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#0f0f11]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-medium bg-[#09090b]/50">
                        <th className="p-4">Full Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">System Role</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                     <tbody className="divide-y divide-slate-900/60">
                      {employees.map(emp => {
                        const isAdmin = currentUser?.role === 'Admin'
                        return (
                          <tr key={emp.id} className="hover:bg-slate-900/20 text-slate-300">
                            <td className="p-4 text-white font-medium">{emp.name}</td>
                            <td className="p-4 text-slate-400">{emp.email}</td>
                            <td className="p-4">
                              {isAdmin ? (
                                <select
                                  value={emp.departmentId || ''}
                                  onChange={e => handleUpdateEmployee(emp.id, { departmentId: e.target.value || undefined })}
                                  className="rounded-lg border border-slate-800 bg-[#161619] px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50 transition"
                                >
                                  <option value="">N/A</option>
                                  {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              ) : (
                                emp.department?.name || 'N/A'
                              )}
                            </td>
                            <td className="p-4">
                              {isAdmin ? (
                                <select
                                  value={emp.role}
                                  onChange={e => handleUpdateEmployee(emp.id, { role: e.target.value })}
                                  className="rounded-lg border border-slate-800 bg-[#161619] px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50 transition"
                                >
                                  <option value="Employee">Employee</option>
                                  <option value="DepartmentHead">Department Head</option>
                                  <option value="AssetManager">Asset Manager</option>
                                  <option value="Admin">Admin</option>
                                </select>
                              ) : (
                                emp.role
                              )}
                            </td>
                            <td className="p-4">
                              {isAdmin ? (
                                <select
                                  value={emp.status}
                                  onChange={e => handleUpdateEmployee(emp.id, { status: e.target.value })}
                                  className="rounded-lg border border-slate-800 bg-[#161619] px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50 transition"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                </select>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/5 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                                  {emp.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">No employees recorded.</p>
              )}
            </div>
          </div>
        )}

        {/* Audit, Reports, Notifications placeholders */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-6 text-center max-w-xl mx-auto my-12">
              <ClipboardCheck className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-white">Compliance Audit System</h3>
              <p className="text-sm text-slate-400 mt-2">
                Conduct periodic hardware and software audits. Align inventory lists with physical assets automatically.
              </p>
              <div className="mt-6 border-t border-slate-900 pt-4 text-left space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Audit Cycles</p>
                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 text-xs">
                  <div>
                    <p className="font-semibold text-white">IT Hardware Audit Q3</p>
                    <p className="text-slate-500 mt-0.5">Scope: Laptops in IT dept</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Asset Status Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Available ({kpis?.availableAssets ?? 0})</span>
                      <span>{Math.round(((kpis?.availableAssets ?? 0) / 204) * 100) || 0}%</span>
                    </div>
                    <div className="h-2 w-full rounded bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${((kpis?.availableAssets ?? 0) / 204) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Allocated ({kpis?.allocatedAssets ?? 0})</span>
                      <span>{Math.round(((kpis?.allocatedAssets ?? 0) / 204) * 100) || 0}%</span>
                    </div>
                    <div className="h-2 w-full rounded bg-slate-950 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${((kpis?.allocatedAssets ?? 0) / 204) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Export Operational Summaries</h3>
                  <p className="text-xs text-slate-500">Generate spreadsheet summary of allocations, returns and bookable assets status.</p>
                </div>
                <button
                  onClick={() => alert('Summary exported (simulation).')}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-[#09090b] hover:bg-emerald-400 transition"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download CSV Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-900 bg-[#0f0f11] p-6 max-w-xl mx-auto my-12">
              <h3 className="text-base font-semibold text-white mb-4">System Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl bg-slate-950 p-3 text-xs border border-slate-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Database in Sync</p>
                    <p className="text-slate-500 mt-0.5">The AssetFlow inventory schema was successfully baselined.</p>
                  </div>
                </div>
                {kpis && kpis.overdueAllocations > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-rose-950/20 p-3 text-xs border border-rose-900/20 text-rose-400">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Action Required: Returns Overdue</p>
                      <p className="text-rose-400 mt-0.5">{kpis.overdueAllocations} active employee allocations have passed their return dates.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Action Modals */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={refreshDashboard}
        currentUser={currentUser}
      />
      <BookResourceModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        onSuccess={refreshDashboard}
        currentUser={currentUser}
      />
      <RaiseRequestsModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSuccess={refreshDashboard}
        currentUser={currentUser}
      />
    </div>
  )
}
