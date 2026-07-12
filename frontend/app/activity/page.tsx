"use client"

import React, { useState, useEffect } from "react"
import {
  Bell,
  Activity,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  BookOpen,
  ArrowRight,
  Wrench,
  ClipboardCheck,
  User,
  CheckCheck
} from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
}

interface ActivityLog {
  id: string
  actorUserId: string
  action: string
  entityType: string
  entityId: string
  timestamp: string
  user: { id: string; name: string; email: string }
}

interface Notification {
  id: string
  userId: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

const ENTITY_ICON: Record<string, React.ReactElement> = {
  Allocation: <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />,
  TransferRequest: <ArrowRight className="h-3.5 w-3.5 text-blue-400" />,
  Booking: <BookOpen className="h-3.5 w-3.5 text-purple-400" />,
  Maintenance: <Wrench className="h-3.5 w-3.5 text-amber-400" />,
  AuditCycle: <ClipboardCheck className="h-3.5 w-3.5 text-cyan-400" />,
  AuditFinding: <ClipboardCheck className="h-3.5 w-3.5 text-rose-400" />
}

const TYPE_COLORS: Record<string, string> = {
  Allocation: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Return: "bg-slate-500/10 text-slate-400 border-slate-600/20",
  Transfer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Booking: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Maintenance: "bg-amber-500/10 text-amber-400 border-amber-500/20"
}

export default function ActivityPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"inbox" | "logs">("inbox")
  const [activeUser, setActiveUser] = useState<Employee | null>(null)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const API_BASE = "http://localhost:5000/api"

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 4000)
  }

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/activities/logs`)
      if (res.ok) setLogs(await res.json())
    } catch (err) {
      console.error("Error fetching activity logs:", err)
    }
  }

  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/activities/notifications?userId=${userId}`)
      if (res.ok) setNotifications(await res.json())
    } catch (err) {
      console.error("Error fetching notifications:", err)
    }
  }

  const fetchSetup = async () => {
    setLoading(true)
    try {
      const [empsRes] = await Promise.all([fetch(`${API_BASE}/employees`)])

      if (empsRes.ok) {
        const empList = await empsRes.json()
        setEmployees(empList)

        // Auto-select active user from token
        const token = localStorage.getItem("assetflow_token")
        let autoSelected = false
        if (token) {
          try {
            const meRes = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            const data = await meRes.json()
            if (data.success && data.user) {
              const matched = empList.find((e: Employee) => e.id === data.user.id)
              if (matched) {
                setActiveUser(matched)
                fetchNotifications(matched.id)
                autoSelected = true
              }
            }
          } catch (e) {}
        }

        if (!autoSelected && empList.length > 0) {
          setActiveUser(empList[0])
          fetchNotifications(empList[0].id)
        }
      }

      await fetchLogs()
    } catch (err) {
      console.error("Error loading setup:", err)
      triggerAlert("error", "Could not connect to the backend server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSetup()
  }, [])

  // When active user changes, reload their notifications
  const handleUserChange = (userId: string) => {
    const found = employees.find(e => e.id === userId)
    if (found) {
      setActiveUser(found)
      fetchNotifications(found.id)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/activities/notifications/${id}/read`, {
        method: "POST"
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        )
      }
    } catch (err) {
      triggerAlert("error", "Failed to update notification status.")
    }
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    for (const n of unread) {
      await handleMarkRead(n.id)
    }
    triggerAlert("success", "All notifications marked as read.")
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-emerald-500" />
            Activity & Notifications
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm">
            System audit trail and personal inbox for asset lifecycle events.
          </p>
        </div>

        {/* Acting User Selector */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={activeUser?.id || ""}
            onChange={(e) => handleUserChange(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Alert */}
      {alert && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            alert.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/30 text-rose-200"
          }`}>
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 w-fit mb-6">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "inbox"
                ? "bg-slate-700 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Inbox className="h-4 w-4" />
            My Inbox
            {unreadCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "logs"
                ? "bg-slate-700 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="h-4 w-4" />
            System Audit Trail
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
            <span className="text-slate-400 text-sm">Loading activity data...</span>
          </div>
        ) : (
          <>
            {/* INBOX TAB */}
            {activeTab === "inbox" && (
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {activeUser?.name}&apos;s Inbox
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeUser?.email}</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-2 text-xs text-slateald-400 hover:text-white border border-slate-700 bg-slate-900 hover:bg-slate-750 px-3 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                    <Bell className="h-12 w-12 opacity-30" />
                    <p className="text-sm italic">No notifications for this user.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`px-6 py-4 flex items-start gap-4 transition-colors ${
                          notif.read ? "opacity-50" : "bg-emerald-950/10 hover:bg-slate-700/20"
                        }`}
                      >
                        {/* Unread dot */}
                        <div className="mt-1.5 shrink-0">
                          {notif.read ? (
                            <div className="h-2 w-2 rounded-full bg-slate-700" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${TYPE_COLORS[notif.type] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
                              {notif.type}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(notif.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-200">{notif.message}</p>
                        </div>

                        {!notif.read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="shrink-0 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-semibold"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SYSTEM AUDIT TRAIL TAB */}
            {activeTab === "logs" && (
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-700/50">
                  <h3 className="text-base font-bold text-white">System Audit Trail</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Last {logs.length} system events</p>
                </div>

                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                    <Activity className="h-12 w-12 opacity-30" />
                    <p className="text-sm italic">No system activity recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                          <th className="px-6 py-3">Timestamp</th>
                          <th className="px-6 py-3">Actor</th>
                          <th className="px-6 py-3">Action</th>
                          <th className="px-6 py-3">Entity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 shrink-0" />
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="font-semibold text-white text-xs">{log.user?.name || "System"}</div>
                              <div className="text-[10px] text-slate-400">{log.user?.email}</div>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-slate-200 text-xs">{log.action}</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-1.5">
                                {ENTITY_ICON[log.entityType] || <Activity className="h-3.5 w-3.5 text-slate-500" />}
                                <div>
                                  <div className="text-xs font-semibold text-slate-300">{log.entityType}</div>
                                  <div className="text-[10px] font-mono text-slate-500">{log.entityId.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
