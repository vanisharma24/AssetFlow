"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Ban
} from "lucide-react"

// Types
interface Asset {
  id: string
  assetTag: string
  name: string
  isBookable: boolean
  status: string
}

interface Employee {
  id: string
  name: string
  email: string
}

interface Booking {
  id: string
  assetId: string
  asset: { name: string; assetTag: string }
  bookedBy: string
  user: { name: string; email: string }
  startTime: string
  endTime: string
  status: string
}

export default function BookingsPage() {
  // Lists data
  const [bookableAssets, setBookableAssets] = useState<Asset[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  // Booking Form State
  const [selectedAssetId, setSelectedAssetId] = useState("")
  const [bookedByUserId, setBookedByUserId] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // Overlap Warning Details
  const [overlapError, setOverlapError] = useState<{
    message: string
    overlap: {
      id: string
      startTime: string
      endTime: string
      bookedBy: string
    }
  } | null>(null)

  // Status Alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const API_BASE = "http://localhost:5000/api"

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  // Load page dependencies
  const fetchPageSetup = async () => {
    try {
      const [assetsRes, empsRes] = await Promise.all([
        fetch(`${API_BASE}/assets?isBookable=true`),
        fetch(`${API_BASE}/employees`)
      ])

      if (assetsRes.ok) setBookableAssets(await assetsRes.json())
      if (empsRes.ok) setEmployees(await empsRes.json())
    } catch (err) {
      console.error("Error loading reservation assets/employees:", err)
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/bookings`)
      if (res.ok) setBookings(await res.json())
    } catch (err) {
      console.error("Error loading reservations list:", err)
      triggerAlert("error", "Could not connect to database API server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPageSetup()
    fetchBookings()
  }, [])

  // Create Reservation
  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault()
    setOverlapError(null)

    if (!selectedAssetId || !bookedByUserId || !startTime || !endTime) {
      triggerAlert("error", "Please fill in all reservation fields.")
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAssetId,
          bookedBy: bookedByUserId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString()
        })
      })

      if (res.status === 201) {
        triggerAlert("success", "Asset reserved successfully!")
        // Reset form
        setSelectedAssetId("")
        setBookedByUserId("")
        setStartTime("")
        setEndTime("")
        fetchBookings()
      } else if (res.status === 409) {
        // Overlap Collision Intercept
        const errorData = await res.json()
        setOverlapError({
          message: errorData.message,
          overlap: errorData.overlap
        })
      } else {
        const errorData = await res.json()
        triggerAlert("error", errorData.error || "Failed to make reservation.")
      }
    } catch (err) {
      triggerAlert("error", "Error connecting to server.")
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel Booking
  const handleCancelBooking = async (id: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      if (res.ok) {
        triggerAlert("success", "Reservation cancelled successfully.")
        fetchBookings()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to cancel reservation.")
      }
    } catch (err) {
      triggerAlert("error", "Error connecting to server.")
    } finally {
      setActionLoading(false)
    }
  }

  // Helper helper to resolve employee name by ID
  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id)
    return emp ? emp.name : `User: ${id.substring(0, 8)}`
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 relative">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Calendar className="h-8 w-8 text-emerald-500" />
          Resource Bookings
        </h1>
        <p className="text-slate-400 mt-2">
          Reserve shared devices/rooms, prevent double booking overlaps, and view calendar schedules.
        </p>
      </div>

      {/* Global Alerts */}
      {alert && (
        <div className="max-w-7xl mx-auto mb-6">
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

      {/* Primary Layout Grid */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Left Column: Create Reservation Form */}
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
            <Plus className="h-5 w-5 text-emerald-500" />
            Reserve a Resource
          </h3>
          <form onSubmit={handleReserve} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Select Bookable Resource</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                required
              >
                <option value="">Select Resource</option>
                {bookableAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetTag} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Reserved For (User)</label>
              <select
                value={bookedByUserId}
                onChange={(e) => setBookedByUserId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Overlap Error Details Alert */}
            {overlapError && (
              <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-xl space-y-2 mt-4 text-rose-200">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <Ban className="h-4 w-4 shrink-0" />
                  Booking Overlap Blocked
                </div>
                <p className="text-xs">{overlapError.message}</p>
                <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-[10px] space-y-1">
                  <div>Holder ID: <strong className="text-slate-300">{getEmployeeName(overlapError.overlap.bookedBy)}</strong></div>
                  <div>Starts: <span className="text-slate-300 font-mono">{new Date(overlapError.overlap.startTime).toLocaleString()}</span></div>
                  <div>Ends: <span className="text-slate-300 font-mono">{new Date(overlapError.overlap.endTime).toLocaleString()}</span></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-4"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Reservation
            </button>
          </form>
        </div>

        {/* Right Column: Bookings Schedule Directory Table */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
            <h3 className="text-lg font-bold text-white">Active Reservations Schedule</h3>
            <span className="text-xs bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-slate-300 font-semibold">
              Total: {bookings.length}
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                  <th className="px-6 py-4">Reserved Resource</th>
                  <th className="px-6 py-4">Booked For</th>
                  <th className="px-6 py-4">Reserved Period</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-sm">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-500 italic">
                      No reservations booked.
                    </td>
                  </tr>
                ) : (
                  bookings.map(book => (
                    <tr key={book.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{book.asset.name}</div>
                        <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">{book.asset.assetTag}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-200">
                            {book.user?.name || `User: ${book.bookedBy.substring(0,8)}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div>Start: {new Date(book.startTime).toLocaleString()}</div>
                        <div className="mt-1">End: {new Date(book.endTime).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          book.status === "Ongoing" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : book.status === "Upcoming"
                            ? "bg-amber-500/10 text-amber-400"
                            : book.status === "Cancelled"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(book.status === "Upcoming" || book.status === "Ongoing") ? (
                          <button
                            onClick={() => handleCancelBooking(book.id)}
                            className="bg-slate-900 text-rose-400 border border-slate-700 hover:text-white hover:bg-rose-600 hover:border-rose-500 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">Expired</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
