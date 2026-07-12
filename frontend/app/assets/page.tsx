"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  MapPin, 
  X, 
  History, 
  User, 
  Clock, 
  Wrench,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Laptop
} from "lucide-react"

// Types
interface Asset {
  id: string
  assetTag: string
  name: string
  categoryId: string
  category: { id: string; name: string; customFields: any }
  serialNumber: string | null
  acquisitionDate: string
  acquisitionCost: string
  condition: string
  location: string
  isBookable: boolean
  status: string
  allocations?: any[]
  bookings?: any[]
  maintenances?: any[]
}

interface AssetCategory {
  id: string
  name: string
  customFields: any // JSON metadata
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Filters State
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [isBookableFilter, setIsBookableFilter] = useState<boolean | null>(null)

  // Form Registration State
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [acquisitionDate, setAcquisitionDate] = useState("")
  const [acquisitionCost, setAcquisitionCost] = useState("")
  const [condition, setCondition] = useState("New")
  const [location, setLocation] = useState("")
  const [isBookable, setIsBookable] = useState(false)
  const [status, setStatus] = useState("Available")

  // Alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const API_BASE = "http://localhost:5000/api"

  // Load list of categories and assets
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`)
      if (res.ok) setCategories(await res.json())
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const fetchAssets = async () => {
    setLoading(true)
    try {
      let query = `${API_BASE}/assets?`
      if (search) query += `search=${encodeURIComponent(search)}&`
      if (statusFilter) query += `status=${encodeURIComponent(statusFilter)}&`
      if (categoryFilter) query += `categoryId=${encodeURIComponent(categoryFilter)}&`
      if (locationFilter) query += `location=${encodeURIComponent(locationFilter)}&`
      if (isBookableFilter !== null) query += `isBookable=${isBookableFilter}&`

      const res = await fetch(query)
      if (res.ok) setAssets(await res.json())
    } catch (err) {
      console.error("Error fetching assets:", err)
      triggerAlert("error", "Failed to connect to backend server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [search, statusFilter, categoryFilter, locationFilter, isBookableFilter])

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  // Submit asset registration
  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !categoryId || !acquisitionDate || !acquisitionCost || !condition || !location) {
      triggerAlert("error", "Please fill in all required fields.")
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId,
          serialNumber: serialNumber || null,
          acquisitionDate,
          acquisitionCost: parseFloat(acquisitionCost),
          condition,
          location,
          isBookable,
          status
        })
      })

      if (res.ok) {
        triggerAlert("success", "Asset registered successfully!")
        // Reset form
        setName("")
        setCategoryId("")
        setSerialNumber("")
        setAcquisitionDate("")
        setAcquisitionCost("")
        setCondition("New")
        setLocation("")
        setIsBookable(false)
        setStatus("Available")
        fetchAssets()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to register asset.")
      }
    } catch (err) {
      triggerAlert("error", "Error connecting to server.")
    } finally {
      setActionLoading(false)
    }
  }

  // Load single asset details + history
  const handleViewAssetDetails = async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`${API_BASE}/assets/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedAsset(data)
      } else {
        triggerAlert("error", "Failed to fetch asset history.")
      }
    } catch (err) {
      triggerAlert("error", "Error connecting to server.")
    } finally {
      setDetailLoading(false)
    }
  }

  // Custom Fields from selected category
  const selectedCatObj = categories.find(c => c.id === categoryId)
  const customFieldsSchema = selectedCatObj?.customFields ? Object.entries(selectedCatObj.customFields) : []

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 relative">
      {/* Header Dashboard Metrics */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Laptop className="h-8 w-8 text-emerald-500" />
            Asset Registry & Directory
          </h1>
          <p className="text-slate-400 mt-2">
            Register new devices, search across categories, and view lifecycle logs.
          </p>
        </div>
      </div>

      {/* Alert Overlay */}
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

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl grid sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tag, name..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under_Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filter by location"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs">
          <span className="text-slate-400">Bookable:</span>
          <button
            onClick={() => setIsBookableFilter(isBookableFilter === null ? true : isBookableFilter === true ? false : null)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              isBookableFilter === true 
                ? "bg-emerald-500/10 text-emerald-400" 
                : isBookableFilter === false 
                ? "bg-rose-500/10 text-rose-400" 
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {isBookableFilter === null ? "Any" : isBookableFilter ? "Yes" : "No"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Left Column: Register New Asset Form */}
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
            <Plus className="h-5 w-5 text-emerald-500" />
            Register Asset
          </h3>
          <form onSubmit={handleRegisterAsset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Asset Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MacBook Pro M3"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                >
                  <option value="">Select</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. C02X874B..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Acquisition Date *</label>
                <input
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Cost (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  placeholder="e.g. 1499.00"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Current Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. HQ Floor 3"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-700/50 pt-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Under_Maintenance">Under Maintenance</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className="flex items-center justify-start gap-2 h-full mt-5">
                <input
                  type="checkbox"
                  id="isBookable"
                  checked={isBookable}
                  onChange={(e) => setIsBookable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 text-emerald-500 bg-slate-900 focus:ring-0"
                />
                <label htmlFor="isBookable" className="text-xs font-semibold text-slate-300 select-none cursor-pointer">
                  Mark as Bookable
                </label>
              </div>
            </div>

            {/* Dynamic Custom Fields Schema Helper */}
            {customFieldsSchema.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Required Specs for {selectedCatObj?.name}</span>
                <div className="space-y-2">
                  {customFieldsSchema.map(([name, type]) => (
                    <div key={name} className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">{name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                        {type as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-4"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Register Device
            </button>
          </form>
        </div>

        {/* Right Column: Assets List Table */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
            <h3 className="text-lg font-bold text-white">Registered Assets</h3>
            <span className="text-xs bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-slate-300 font-semibold">
              Total: {assets.length}
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                  <th className="px-6 py-4">Tag</th>
                  <th className="px-6 py-4">Asset Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-sm">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-500 italic">
                      No assets found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-emerald-400 text-xs font-bold">{asset.assetTag}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-white">{asset.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {asset.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 font-medium">{asset.category?.name || "Uncategorized"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          asset.status === "Available" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : asset.status === "Allocated"
                            ? "bg-blue-500/10 text-blue-400"
                            : asset.status === "Reserved"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {asset.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewAssetDetails(asset.id)}
                          className="bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Asset Details / History Drawer Overlay */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-slate-800 border-l border-slate-700 h-full p-8 flex flex-col shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-300">
            {/* Close Button */}
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 p-2 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 border-b border-slate-700/50 pb-5">
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-full">{selectedAsset.assetTag}</span>
              <h2 className="text-2xl font-bold text-white mt-3">{selectedAsset.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs">
                <span>Category: <strong className="text-white">{selectedAsset.category?.name}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-white">{selectedAsset.location}</strong></span>
              </div>
            </div>

            {/* General Specs Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Acquired</div>
                  <div className="text-sm font-semibold text-slate-200">
                    {new Date(selectedAsset.acquisitionDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Cost</div>
                  <div className="text-sm font-semibold text-slate-200">${selectedAsset.acquisitionCost}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Condition</div>
                  <div className="text-sm font-semibold text-slate-200">{selectedAsset.condition}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Laptop className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Serial Number</div>
                  <div className="text-sm font-semibold text-slate-200">{selectedAsset.serialNumber || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Lifecycle Logs Tabs/Sections */}
            <div className="flex-1 space-y-6">
              {/* Allocations History */}
              <div className="border border-slate-700/40 rounded-xl overflow-hidden bg-slate-900/10">
                <div className="bg-slate-900/50 p-4 border-b border-slate-700/40 flex items-center gap-2 text-sm font-bold text-white">
                  <User className="h-4 w-4 text-emerald-500" />
                  Allocations Log
                </div>
                <div className="p-4 space-y-3">
                  {!selectedAsset.allocations || selectedAsset.allocations.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No allocations recorded for this asset.</p>
                  ) : (
                    selectedAsset.allocations.map((alloc: any) => (
                      <div key={alloc.id} className="flex justify-between items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs">
                        <div>
                          <div className="font-semibold text-white">
                            {alloc.holderType === "Employee" ? "Employee Holder" : "Department Holder"}: {alloc.holderId}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Allocated: {new Date(alloc.allocatedAt).toLocaleDateString()}
                          </div>
                          {alloc.returnConditionNotes && (
                            <div className="text-[10px] text-slate-400 bg-slate-800/80 p-2 rounded mt-2 border border-slate-700/30">
                              Return Note: &quot;{alloc.returnConditionNotes}&quot;
                            </div>
                          )}
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alloc.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {alloc.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bookings History */}
              <div className="border border-slate-700/40 rounded-xl overflow-hidden bg-slate-900/10">
                <div className="bg-slate-900/50 p-4 border-b border-slate-700/40 flex items-center gap-2 text-sm font-bold text-white">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  Reservations History
                </div>
                <div className="p-4 space-y-3">
                  {!selectedAsset.bookings || selectedAsset.bookings.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No reservations booked.</p>
                  ) : (
                    selectedAsset.bookings.map((book: any) => (
                      <div key={book.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs">
                        <div>
                          <div className="font-semibold text-white">Booked by ID: {book.bookedBy}</div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(book.startTime).toLocaleString()} - {new Date(book.endTime).toLocaleString()}
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          book.status === "Upcoming" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {book.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
