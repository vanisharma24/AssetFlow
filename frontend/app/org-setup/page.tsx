"use client"

import { useState, useEffect } from "react"
import { 
  Building2, 
  Tag, 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sliders,
  UserCheck
} from "lucide-react"

// TypeScript interfaces based on Prisma models
interface Department {
  id: string
  name: string
  status: string
  headUserId: string | null
  users: { id: string; name: string }[]
}

interface AssetCategory {
  id: string
  name: string
  customFields: any // JSON
}

interface Employee {
  id: string
  name: string
  email: string
  role: string
  status: string
  departmentId: string | null
  department: { id: string; name: string } | null
}

export default function OrgSetupPage() {
  const [activeTab, setActiveTab] = useState<"departments" | "categories" | "employees">("departments")
  
  // Data States
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form States - Departments
  const [deptName, setDeptName] = useState("")
  const [deptHeadId, setDeptHeadId] = useState("")
  const [deptStatus, setDeptStatus] = useState("Active")
  
  // Form States - Asset Categories
  const [catName, setCatName] = useState("")
  const [customFields, setCustomFields] = useState<{ name: string; type: "text" | "number" | "boolean" | "date" }[]>([])
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "boolean" | "date">("text")
  
  // Status/Alert messages
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // API Base URL
  const API_BASE = "http://localhost:5000/api"

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [deptRes, catRes, empRes] = await Promise.all([
        fetch(`${API_BASE}/departments`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/employees`)
      ])

      if (deptRes.ok) setDepartments(await deptRes.json())
      if (catRes.ok) setCategories(await catRes.json())
      if (empRes.ok) setEmployees(await empRes.json())
    } catch (error) {
      console.error("Error fetching setup data:", error)
      triggerAlert("error", "Could not connect to backend server. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  // --- Department Form Actions ---
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim()) return

    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: deptName,
          headUserId: deptHeadId || null,
          status: deptStatus
        })
      })

      if (res.ok) {
        triggerAlert("success", `Department "${deptName}" created successfully.`)
        setDeptName("")
        setDeptHeadId("")
        setDeptStatus("Active")
        fetchData()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to create department.")
      }
    } catch (err) {
      triggerAlert("error", "Failed to create department due to connection error.")
    } finally {
      setActionLoading(false)
    }
  }

  // --- Category Form Actions ---
  const addCustomField = () => {
    if (!newFieldName.trim()) return
    // Prevent duplicate field names
    if (customFields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase())) {
      triggerAlert("error", "Field name already exists")
      return
    }
    setCustomFields([...customFields, { name: newFieldName.trim(), type: newFieldType }])
    setNewFieldName("")
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return

    setActionLoading(true)
    try {
      // Map custom fields to an object representation for JSON field in schema
      const fieldsObj: Record<string, string> = {}
      customFields.forEach(f => {
        fieldsObj[f.name] = f.type
      })

      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          customFields: customFields.length > 0 ? fieldsObj : null
        })
      })

      if (res.ok) {
        triggerAlert("success", `Category "${catName}" created successfully.`)
        setCatName("")
        setCustomFields([])
        fetchData()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to create asset category.")
      }
    } catch (err) {
      triggerAlert("error", "Failed to create category due to connection error.")
    } finally {
      setActionLoading(false)
    }
  }

  // --- Employee Assignment Actions ---
  const handleAssignDepartment = async (empId: string, departmentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/employees/${empId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: departmentId || null
        })
      })

      if (res.ok) {
        triggerAlert("success", "Department assigned successfully.")
        fetchData()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to assign department.")
      }
    } catch (err) {
      triggerAlert("error", "Connection error. Failed to assign department.")
    }
  }

  const handleUpdateRole = async (empId: string, role: string) => {
    // For MVP, since role modification in User schema requires specific promotion API, 
    // we route to the update endpoint of employee PATCH router.
    try {
      const res = await fetch(`${API_BASE}/employees/${empId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role
        })
      })

      if (res.ok) {
        triggerAlert("success", `User role updated to ${role} successfully.`)
        fetchData()
      } else {
        const err = await res.json()
        triggerAlert("error", err.error || "Failed to update role.")
      }
    } catch (err) {
      triggerAlert("error", "Connection error. Failed to update role.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Sliders className="h-8 w-8 text-emerald-500" />
          Organization Setup
        </h1>
        <p className="text-slate-400 mt-2">
          Configure company departments, setup category metadata, and manage employee directories.
        </p>
      </div>

      {/* Alerts */}
      {alert && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            alert.type === "success" 
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200" 
              : "bg-rose-950/40 border-rose-500/30 text-rose-200"
          }`}>
            {alert.type === "success" ? <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-slate-800">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("departments")}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all relative ${
              activeTab === "departments" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Departments
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all relative ${
              activeTab === "categories" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tag className="h-4 w-4" />
            Asset Categories
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all relative ${
              activeTab === "employees" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Employee Directory
          </button>
        </div>
      </div>

      {/* Main Tab Contents */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <span className="text-sm text-slate-400">Loading organizational setup parameters...</span>
          </div>
        ) : (
          <>
            {/* TAB: DEPARTMENTS */}
            {activeTab === "departments" && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Create Department Form Card */}
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl h-fit">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-emerald-500" />
                    New Department
                  </h3>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Department Name</label>
                      <input
                        type="text"
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                        placeholder="e.g. Finance, HR, Engineering"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Department Head</label>
                      <select
                        value={deptHeadId}
                        onChange={(e) => setDeptHeadId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      >
                        <option value="">Select Department Head (Optional)</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Status</label>
                      <select
                        value={deptStatus}
                        onChange={(e) => setDeptStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Add Department
                    </button>
                  </form>
                </div>

                {/* Departments List */}
                <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-lg font-bold text-white">Active Departments</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                          <th className="px-6 py-4">Department Name</th>
                          <th className="px-6 py-4">Head ID</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Staff Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30 text-sm">
                        {departments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-10 text-slate-500">
                              No departments created yet.
                            </td>
                          </tr>
                        ) : (
                          departments.map(dept => (
                            <tr key={dept.id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-white">{dept.name}</td>
                              <td className="px-6 py-4 text-slate-400 font-mono text-xs">{dept.headUserId || "Not Assigned"}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  dept.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                                }`}>
                                  {dept.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-300 font-medium">
                                {dept.users?.length || 0} employees
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ASSET CATEGORIES */}
            {activeTab === "categories" && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Create Category Form Card */}
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl h-fit">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-emerald-500" />
                    New Asset Category
                  </h3>
                  <form onSubmit={handleCreateCategory} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Category Name</label>
                      <input
                        type="text"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="e.g. Laptops, Office Desks, Vehicles"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                        required
                      />
                    </div>

                    {/* Custom Fields Builder */}
                    <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/40">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Custom Fields (Attributes)</h4>
                      
                      {/* Form inputs for new field */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          placeholder="Field Name (e.g. RAM)"
                          className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="date">Date</option>
                        </select>
                        <button
                          type="button"
                          onClick={addCustomField}
                          className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Display added fields */}
                      <div className="space-y-2 mt-2">
                        {customFields.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No custom fields added yet.</p>
                        ) : (
                          customFields.map((field, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
                              <span className="font-semibold text-white">{field.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {field.type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeCustomField(idx)}
                                  className="text-rose-400 hover:text-rose-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Create Category
                    </button>
                  </form>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-lg font-bold text-white">Asset Categories</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                          <th className="px-6 py-4">Category Name</th>
                          <th className="px-6 py-4">Custom Fields Metadata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30 text-sm">
                        {categories.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="text-center py-10 text-slate-500">
                              No categories created yet.
                            </td>
                          </tr>
                        ) : (
                          categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-white">{cat.name}</td>
                              <td className="px-6 py-4 text-slate-300">
                                {cat.customFields ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(cat.customFields).map(([name, type]) => (
                                      <span key={name} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                                        {name}
                                        <span className="text-[10px] text-emerald-400 uppercase">({type as string})</span>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-500 italic">None</span>
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
            )}

            {/* TAB: EMPLOYEE DIRECTORY */}
            {activeTab === "employees" && (
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Employee & User Directory</h3>
                  <span className="text-xs font-semibold bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-slate-300">
                    Total: {employees.length} Users
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase">
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Department Assignment</th>
                        <th className="px-6 py-4">Modify Access Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30 text-sm">
                      {employees.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-slate-500">
                            No employees/users found in directory.
                          </td>
                        </tr>
                      ) : (
                        employees.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-white">{emp.name}</div>
                                <div className="text-xs text-slate-400">{emp.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                emp.role === "Admin" 
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                  : emp.role === "Manager"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                <Shield className="h-3 w-3" />
                                {emp.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={emp.departmentId || ""}
                                onChange={(e) => handleAssignDepartment(emp.id, e.target.value)}
                                className="bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="">Not Assigned</option>
                                {departments.map(dept => (
                                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateRole(emp.id, "Employee")}
                                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border ${
                                    emp.role === "Employee" 
                                      ? "bg-emerald-600 text-white border-emerald-500" 
                                      : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800"
                                  }`}
                                >
                                  Employee
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(emp.id, "Manager")}
                                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border ${
                                    emp.role === "Manager" 
                                      ? "bg-emerald-600 text-white border-emerald-500" 
                                      : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800"
                                  }`}
                                >
                                  Manager
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(emp.id, "Admin")}
                                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border ${
                                    emp.role === "Admin" 
                                      ? "bg-emerald-600 text-white border-emerald-500" 
                                      : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800"
                                  }`}
                                >
                                  Admin
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
