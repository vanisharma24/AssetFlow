"use client"

import * as React from "react"
import { format, parse, isWithinInterval, areIntervalsOverlapping } from "date-fns"
import { PlusCircleIcon, AlertCircleIcon, TrashIcon, DownloadIcon } from "lucide-react"
import { FullScreenCalendar, CalendarEvent } from "@/components/ui/fullscreen-calendar"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  asset: string
  category: string
  bookedBy: string
  date: string          // "yyyy-MM-dd"
  startTime: string     // "HH:mm"
  endTime: string       // "HH:mm"
  purpose: string
  color: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ASSETS = [
  { id: "A001", name: "Conference Room Alpha", category: "Room" },
  { id: "A002", name: "Conference Room Beta", category: "Room" },
  { id: "A003", name: "Projector Pro 4K", category: "Equipment" },
  { id: "A004", name: "Video Camera EOS R5", category: "Equipment" },
  { id: "A005", name: "Fleet Van #1", category: "Vehicle" },
  { id: "A006", name: "Fleet Van #2", category: "Vehicle" },
  { id: "A007", name: "Laptop Dell XPS 15", category: "Equipment" },
  { id: "A008", name: "Training Hall", category: "Room" },
]

const EVENT_COLORS: Record<string, string> = {
  Room: "bg-blue-500",
  Equipment: "bg-emerald-500",
  Vehicle: "bg-amber-500",
}

// Seed demo bookings
const today = new Date()
const todayStr = format(today, "yyyy-MM-dd")

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    asset: "Conference Room Alpha",
    category: "Room",
    bookedBy: "Anjali Sharma",
    date: todayStr,
    startTime: "09:00",
    endTime: "10:30",
    purpose: "Q3 Planning Meeting",
    color: "bg-blue-500",
  },
  {
    id: "b2",
    asset: "Projector Pro 4K",
    category: "Equipment",
    bookedBy: "Ravi Kumar",
    date: todayStr,
    startTime: "10:00",
    endTime: "11:00",
    purpose: "Product Demo",
    color: "bg-emerald-500",
  },
  {
    id: "b3",
    asset: "Fleet Van #1",
    category: "Vehicle",
    bookedBy: "Priya Nair",
    date: todayStr,
    startTime: "14:00",
    endTime: "17:00",
    purpose: "Client Site Visit",
    color: "bg-amber-500",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateTime(date: string, time: string): Date {
  return parse(`${date}T${time}`, "yyyy-MM-dd'T'HH:mm", new Date())
}

function detectConflicts(bookings: Booking[], candidate: Omit<Booking, "id">): Booking[] {
  return bookings.filter((b) => {
    if (b.asset !== candidate.asset) return false
    if (b.date !== candidate.date) return false
    return areIntervalsOverlapping(
      { start: toDateTime(b.date, b.startTime), end: toDateTime(b.date, b.endTime) },
      { start: toDateTime(candidate.date, candidate.startTime), end: toDateTime(candidate.date, candidate.endTime) },
      { inclusive: false }
    )
  })
}

function bookingsToCalendarEvents(bookings: Booking[]): CalendarEvent[] {
  return bookings.map((b) => ({
    id: b.id,
    name: `${b.asset} – ${b.bookedBy}`,
    time: `${b.startTime}–${b.endTime}`,
    datetime: `${b.date}T${b.startTime}`,
    color: b.color,
  }))
}

function downloadCSV(bookings: Booking[]) {
  const header = ["ID", "Asset", "Category", "Booked By", "Date", "Start", "End", "Purpose"]
  const rows = bookings.map((b) => [
    b.id, b.asset, b.category, b.bookedBy, b.date, b.startTime, b.endTime,
    `"${b.purpose.replace(/"/g, '""')}"`,
  ])
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `bookings-${todayStr}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Modal form ───────────────────────────────────────────────────────────────

interface BookingFormProps {
  initialDate: string
  onClose: () => void
  onSave: (booking: Omit<Booking, "id">) => { conflicts: Booking[] }
}

function BookingModal({ initialDate, onClose, onSave }: BookingFormProps) {
  const [form, setForm] = React.useState({
    asset: ASSETS[0].name,
    category: ASSETS[0].category,
    bookedBy: "",
    date: initialDate,
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
  })
  const [conflicts, setConflicts] = React.useState<Booking[]>([])
  const [saved, setSaved] = React.useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === "asset") {
      const found = ASSETS.find((a) => a.name === value)
      setForm((f) => ({ ...f, asset: value, category: found?.category ?? "" }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
    setConflicts([])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = onSave({ ...form, color: EVENT_COLORS[form.category] ?? "bg-emerald-500" })
    if (result.conflicts.length > 0) {
      setConflicts(result.conflicts)
    } else {
      setSaved(true)
      setTimeout(onClose, 900)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">New Resource Booking</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 text-2xl">✓</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Booking confirmed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Conflict warning */}
            {conflicts.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircleIcon className="size-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Booking conflict detected</p>
                  {conflicts.map((c) => (
                    <p key={c.id} className="text-xs mt-0.5">
                      {c.bookedBy} has <strong>{c.asset}</strong> from {c.startTime}–{c.endTime}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Asset */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Asset / Resource</label>
                <select
                  name="asset"
                  value={form.asset}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ASSETS.map((a) => (
                    <option key={a.id} value={a.name}>{a.name} ({a.category})</option>
                  ))}
                </select>
              </div>

              {/* Booked By */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Booked By</label>
                <input
                  name="bookedBy"
                  type="text"
                  value={form.bookedBy}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Purpose</label>
                <input
                  name="purpose"
                  type="text"
                  value={form.purpose}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Team Meeting"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Start time */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Start Time</label>
                <input
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* End time */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">End Time</label>
                <input
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm Booking
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Bookings Table ───────────────────────────────────────────────────────────

function BookingTable({ bookings, onDelete }: { bookings: Booking[]; onDelete: (id: string) => void }) {
  const [filter, setFilter] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("All")

  const filtered = bookings.filter((b) => {
    const matchesText =
      b.asset.toLowerCase().includes(filter.toLowerCase()) ||
      b.bookedBy.toLowerCase().includes(filter.toLowerCase()) ||
      b.purpose.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = categoryFilter === "All" || b.category === categoryFilter
    return matchesText && matchesCategory
  })

  const categories = ["All", ...Array.from(new Set(bookings.map((b) => b.category)))]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search bookings…"
          className="flex-1 min-w-[200px] rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === c
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Booked By</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                  No bookings found
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${b.color}`} />
                      {b.asset}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs">
                      {b.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{b.bookedBy}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{b.date}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {b.startTime} – {b.endTime}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">{b.purpose}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDelete(b.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Delete booking"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>(INITIAL_BOOKINGS)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [modalDate, setModalDate] = React.useState(todayStr)
  const [activeTab, setActiveTab] = React.useState<"calendar" | "table">("calendar")

  const calendarEvents = React.useMemo(
    () => bookingsToCalendarEvents(bookings),
    [bookings]
  )

  function openModal(date: Date) {
    setModalDate(format(date, "yyyy-MM-dd"))
    setModalOpen(true)
  }

  function handleSave(candidate: Omit<Booking, "id">): { conflicts: Booking[] } {
    const conflicts = detectConflicts(bookings, candidate)
    if (conflicts.length === 0) {
      setBookings((prev) => [
        ...prev,
        { ...candidate, id: `b${Date.now()}` },
      ])
    }
    return { conflicts }
  }

  function handleDelete(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Resource Bookings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Book and manage company assets — rooms, equipment, vehicles
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-sm">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeTab === "calendar"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeTab === "table"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Table
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadCSV(bookings)}
              className="gap-1.5"
            >
              <DownloadIcon className="size-4" /> Export CSV
            </Button>

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => openModal(new Date())}
            >
              <PlusCircleIcon className="size-4" /> New Booking
            </Button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-6 text-sm">
          {[
            { label: "Total Bookings", value: bookings.length },
            { label: "Today", value: bookings.filter((b) => b.date === todayStr).length },
            { label: "Rooms", value: bookings.filter((b) => b.category === "Room").length },
            { label: "Equipment", value: bookings.filter((b) => b.category === "Equipment").length },
            { label: "Vehicles", value: bookings.filter((b) => b.category === "Vehicle").length },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">{s.label}:</span>
              <span className="font-semibold text-emerald-600">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {activeTab === "calendar" ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: 480 }}>
            <FullScreenCalendar
              events={calendarEvents}
              onDayClick={openModal}
              onAddClick={openModal}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <BookingTable bookings={bookings} onDelete={handleDelete} />
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <BookingModal
          initialDate={modalDate}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
