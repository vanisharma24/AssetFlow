'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
  LogOut
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type NavItem = {
  name: string
  icon: typeof LayoutDashboard
  href: string
  tab?: string // for tabs hosted inside the dashboard at "/"
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/', tab: 'dashboard' },
  { name: 'Organization setup', icon: Building2, href: '/org-setup' },
  { name: 'Assets', icon: Package, href: '/assets' },
  { name: 'Allocation & Transfer', icon: ArrowLeftRight, href: '/allocations' },
  { name: 'Resource Booking', icon: CalendarDays, href: '/bookings' },
  { name: 'Maintenance', icon: Wrench, href: '/?tab=maintenance', tab: 'maintenance' },
  { name: 'Audit', icon: ClipboardCheck, href: '/?tab=audit', tab: 'audit' },
  { name: 'Reports', icon: BarChart3, href: '/report' },
  { name: 'Notifications', icon: Bell, href: '/?tab=notifications', tab: 'notifications' }
]

type UserProfile = { name: string; role: string }

export default function DashboardSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)

  const activeTab = searchParams.get('tab') || 'dashboard'

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
          setUser(data.user)
        }
      } catch {
        /* ignore */
      }
    }
    fetchUser()
  }, [])

  const isActive = (item: NavItem) => {
    if (item.tab) return pathname === '/' && activeTab === item.tab
    // route-hosted pages
    return pathname === item.href
  }

  const handleLogout = () => {
    localStorage.removeItem('assetflow_token')
    window.dispatchEvent(new Event('assetflow-auth'))
    router.push('/')
  }

  return (
    <aside className="w-64 shrink-0 border-r border-slate-900 bg-[#0c0c0e] px-4 py-6 flex flex-col justify-between">
      <div>
        <Link href="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="h-7 w-7 rounded bg-emerald-500 text-[#09090b] flex items-center justify-center font-bold text-sm">
            AF
          </div>
          <span className="text-lg font-bold tracking-tight text-white">AssetFlow</span>
        </Link>

        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition ${
                  active
                    ? 'border border-emerald-500/50 text-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {user && (
        <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-semibold text-xs border border-slate-700">
              {user.name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
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
  )
}
