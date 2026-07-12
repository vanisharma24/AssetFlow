"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  User, 
  Building2, 
  X,
  Loader2,
  Inbox
} from "lucide-react"

// Types
interface Asset {
  id: string
  assetTag: string
  name: string
  status: string
}

interface Employee {
  id: string
  name: string
  email: string
}

interface Department {
  id: string
  name: string
}

interface Allocation {
  id: string
  assetId: string
  asset: { name: string; assetTag: string }
  holderType: string
  holderId: string
  employee?: { name: string; email: string } | null
  department?: { name: string } | null
  allocatedAt: string
  expectedReturnDate: string
  returnedAt: string | null
  returnConditionNotes: string | null
  status: string
}

interface TransferRequest {
  id: string
  assetId: string
  fromHolderId: string
  toHolderId: string
  requestedBy: string
  status: string
  approvedBy: string | null
  approvedAt: string | null
}

export default function AllocationsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "transfers">("active")
  
  // Data Lists
  const [assets, setAssets] = useState<Asset[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Allocation Form State
  const [selectedAssetId, setSelectedAssetId] = useState("")
  const [holderType, setHolderType] = useState<"Employee" | "Department">("Employee")
  const [holderId, setHolderId] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")

  // Double Allocation Conflict Modal/Alert State
  const [conflictData, setConflictData] = useState<{
    assetId: string
    holderType: string
    currentHolderId: string
    proposedHolderId: string
  } | null>(null)

  // Return Processing Dialog State
  const [returningAllocationId, setReturningAllocationId] = useState<string | null>(null)
  const [returnNotes, setReturnNotes] = useState("")

  // Global Alert / Loading
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const API_BASE = "http://localhost:5000/api"

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  // Load setup and transactional lists
  const fetchSetupData = async () => {
    try {
      const [assetsRes, empsRes, deptsRes] = await Promise.all([
        fetch(`${API_BASE}/assets`),
        fetch(`${API_BASE}/employees`),
        fetch(`${API_BASE}/departments`)
      ])

      if (assetsRes.ok) setAssets(await assetsRes.json())
      if (empsRes.ok) setEmployees(await empsRes.json())
      if (deptsRes.ok) setDepartments(await deptsRes.json())
    } catch (err) {
      console.error("Error loading allocation setup data:", err)
    }
  }

  const fetchAllocationsAndTransfers = async () => {
    setLoading(true)
    try {
      const [allocRes, transRes] = await Promise.all([
        fetch(`${API_BASE}/allocations`),
        fetch(`${API_BASE}/transfers`)
      ])

      if (allocRes.ok) setAllocations(await allocRes.json())
      if (transRes.ok) setTransfers(await transRes.json())
    } catch (err) {
      console.error("Error loading transaction data:", err)
      triggerAlert("error", "Could not connect to backend API server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSetupData()
    fetchAllocationsAndTransfers()
  }, [])

  // Create Allocation
  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetId || !holderId || !expectedReturnDate) {
      triggerAlert("error", "Please fill in all allocation parameters.")
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAssetId,
          holderType,
          holderId,
          expectedReturnDate
        })
      })

      if (res.status === 201) {
        triggerAlert("success", "Asset allocated successfully!")
        // Reset form
        setSelectedAssetId("")
        setHolderId("")
        setExpectedReturnDate("")
        fetchAllocationsAndTransfers()
      } else if (res.status === 409) {
        // Intercept Double-Allocation conflict block
        const errorData = await res.json()
        setConflictData({
          assetId: selectedAssetId,
          holderType: errorData.holderType,
          currentHolderId: errorData.currentHolderId,
          proposedHolderId: holderId
        })
      } else {
        const errorData = await res.json()
        triggerAlert("error", errorData.error || "Failed to create allocation.")
      }
    } catch (err) {
      triggerAlert("error", "Error connecting to server.")
    } finally {
      setActionLoading(false)
    }
  }

  // Raise Transfer Request dynamically from conflict popup
  const handleRaiseTransfer = async () => {
    if (!conflictData) return

    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: conflictData.assetId,
          toHolderId: conflictData.proposedHolderId,
          requestedBy: "Admin Manager"
        })
      })

      if (res.ok) {
        triggerAlert("success", "Transfer request created successfully!")
        setConflictData(null)
        // Reset form
        setSelectedAssetId("")
        setHolderId("")
        setExpectedReturnDate("")
        fetchAllocationsAndTransfers()
        setActiveTab("transfers")
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to raise transfer request.")
      }
    } catch (err) {
      triggerAlert("error", "Error connection to server.")
    } finally {
      setActionLoading(false)
    }
  }

  // Process Return Action
  const handleReturnAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!returningAllocationId || !returnNotes.trim()) return

    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/allocations/${returningAllocationId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnConditionNotes: returnNotes
        })
      })

      if (res.ok) {
        triggerAlert("success", "Asset returned successfully!")
        setReturningAllocationId(null)
        setReturnNotes("")
        fetchAllocationsAndTransfers()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to process asset return.")
      }
    } catch (err) {
      triggerAlert("error", "Error connecting to server.")
    } finally {
      setActionLoading(false)
    }
  }

  // Approve Transfer Request Action
  const handleApproveTransfer = async (reqId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/transfers/${reqId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvedBy: "Admin User"
        })
      })

      if (res.ok) {
        triggerAlert("success", "Transfer approved and re-allocated successfully!")
        fetchAllocationsAndTransfers()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to approve transfer.")
      }
    } catch (err) {
      triggerAlert("error", "Connection error. Failed to approve transfer.")
    } finally {
      setActionLoading(false)
    }
  }

  // Helper helper to get holder readable name (matches ID to user name or dept name)
  const getHolderName = (id: string, type: string) => {
    if (type === "Employee") {
      const emp = employees.find(e => e.id === id)
      return emp ? emp.name : `User: ${id.substring(0, 8)}`
    } else {
      const dept = departments.find(d => d.id === id)
      return dept ? `${dept.name} (Dept)` : `Dept: ${id.substring(0, 8)}`
    }
  }

  return (
    <div className="dashboard-theme min-h-screen bg-slate-900 text-slate-100 font-sans p-6 relative">
      {/* Top Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <RefreshCw className="h-8 w-8 text-emerald-500" />
          Allocations & Transfers
        </h1>
        <p className="text-slate-400 mt-2">
          Issue assets to departments or users, process device returns, and resolve allocation transfers.
        </p>
      </div>

      {/* Global Alert Notification */}
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
        {/* Left Column: Allocation Form */}
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-3">
            <Plus className="h-5 w-5 text-emerald-500" />
            Issue / Allocate Asset
          </h3>
          <form onSubmit={handleAllocate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Select Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                required
              >
                <option value="">Select Asset</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetTag} - {asset.name} ({asset.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assign To (Holder Type)</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => { setHolderType("Employee"); setHolderId(""); }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    holderType === "Employee" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => { setHolderType("Department"); setHolderId(""); }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    holderType === "Department" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Department
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                Select {holderType === "Employee" ? "Employee Assignee" : "Target Department"}
              </label>
              <select
                value={holderId}
                onChange={(e) => setHolderId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                required
              >
                <option value="">Select Assignee</option>
                {holderType === "Employee" 
                  ? employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))
                  : departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))
                }
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Expected Return Date</label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-4"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Assign Asset
            </button>
          </form>
        </div>

        {/* Right Column: Tab View Lists */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          {/* Tab Selection */}
          <div className="bg-slate-800/40 border-b border-slate-700/50 flex">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "active" 
                  ? "bg-slate-900/30 text-emerald-400 border-b-2 border-emerald-400" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="h-4 w-4" />
              Active Allocations
            </button>
            <button
              onClick={() => setActiveTab("transfers")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "transfers" 
                  ? "bg-slate-900/30 text-emerald-400 border-b-2 border-emerald-400" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ArrowRight className="h-4 w-4" />
              Transfer Requests
            </button>
          </div>

          {/* List Contents */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                <span className="text-sm text-slate-500">Loading transactional data...</span>
              </div>
            ) : (
              <>
                {/* Active Allocations Tab */}
                {activeTab === "active" && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                        <th className="px-6 py-4">Asset Details</th>
                        <th className="px-6 py-4">Holder</th>
                        <th className="px-6 py-4">Allocated / Expected Return</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30 text-sm">
                      {allocations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-20 text-slate-500 italic">
                            No allocations recorded.
                          </td>
                        </tr>
                      ) : (
                        allocations.map(alloc => (
                          <tr key={alloc.id} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-white">{alloc.asset.name}</div>
                              <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">{alloc.asset.assetTag}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {alloc.holderType === "Employee" ? <User className="h-4 w-4 text-slate-400" /> : <Building2 className="h-4 w-4 text-slate-400" />}
                                <span className="font-medium text-slate-200">
                                  {alloc.holderType === "Employee" 
                                    ? alloc.employee?.name || `Emp ID: ${alloc.holderId.substring(0,8)}` 
                                    : alloc.department?.name || `Dept ID: ${alloc.holderId.substring(0,8)}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400">
                              <div>Issued: {new Date(alloc.allocatedAt).toLocaleDateString()}</div>
                              <div className="mt-1">Return: {new Date(alloc.expectedReturnDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {alloc.status === "Active" ? (
                                <button
                                  onClick={() => setReturningAllocationId(alloc.id)}
                                  className="bg-slate-900 text-rose-400 border border-slate-700 hover:text-white hover:bg-rose-600 hover:border-rose-500 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                >
                                  Return Asset
                                </button>
                              ) : (
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-900 border border-slate-800 text-slate-500">
                                  Returned
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* Transfer Requests Tab */}
                {activeTab === "transfers" && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                        <th className="px-6 py-4">Asset ID</th>
                        <th className="px-6 py-4">Transfer Details</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30 text-sm">
                      {transfers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-20 text-slate-500 italic">
                            No transfer requests.
                          </td>
                        </tr>
                      ) : (
                        transfers.map(req => (
                          <tr key={req.id} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-300">
                              {req.assetId.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400 font-medium">From:</span>
                                <span className="font-semibold text-white">{getHolderName(req.fromHolderId, "Employee")}</span>
                                <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                                <span className="text-slate-400 font-medium">To:</span>
                                <span className="font-semibold text-white">{getHolderName(req.toHolderId, "Employee")}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">Requested by: {req.requestedBy}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                req.status === "Requested" 
                                  ? "bg-amber-500/10 text-amber-400" 
                                  : "bg-emerald-500/10 text-emerald-400"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {req.status === "Requested" ? (
                                <button
                                  onClick={() => handleApproveTransfer(req.id)}
                                  className="bg-emerald-600 border border-emerald-500 text-white hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                                >
                                  Approve
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Double Allocation Warning -> Prompt Transfer Request */}
      {conflictData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in duration-200">
            <button
              onClick={() => setConflictData(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
              <h3 className="text-lg font-bold text-white">Double Allocation Blocked</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              The selected asset is currently held by{" "}
              <strong className="text-white">
                {getHolderName(conflictData.currentHolderId, conflictData.holderType)}
              </strong>
              . You cannot issue a device that is actively held.
            </p>
            <div className="bg-slate-900 border border-slate-700/60 p-4 rounded-xl mb-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Alternative Action</span>
              <p className="text-xs text-slate-300 leading-normal">
                Would you like to raise a **Transfer Request** to request a sequential handover to your selected holder?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConflictData(null)}
                className="flex-1 h-10 border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseTransfer}
                disabled={actionLoading}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Raise Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Return Asset Condition Notes */}
      {returningAllocationId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in duration-200">
            <button
              onClick={() => setReturningAllocationId(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Inbox className="h-6 w-6 text-emerald-500 shrink-0" />
              <h3 className="text-lg font-bold text-white">Process Device Return</h3>
            </div>
            <form onSubmit={handleReturnAsset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Return Condition Notes *</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Describe condition (e.g. Scratches on lid, functioning perfectly)"
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReturningAllocationId(null)}
                  className="flex-1 h-10 border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
