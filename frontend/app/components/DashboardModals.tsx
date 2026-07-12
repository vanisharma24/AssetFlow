import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Category = { id: string; name: string }
type Employee = { id: string; name: string; email: string }
type Asset = { id: string; name: string; assetTag: string; status: string; isBookable: boolean }

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentUser: { id: string; name: string; email: string } | null
}

export function RegisterAssetModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    condition: 'Good',
    location: '',
    isBookable: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`)
        if (res.ok) setCategories(await res.json())
      } catch (e) {
        console.error(e)
      }
    }
    fetchCats()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.categoryId) {
      setError('Please select a category')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          acquisitionCost: parseFloat(form.acquisitionCost) || 0
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to register asset')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0f0f11] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-semibold tracking-wide text-emerald-400">+ Register Asset</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">✖</button>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 text-sm">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Asset Name</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition"
              placeholder="e.g. MacBook Pro M3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Category</label>
              <select
                required
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Serial Number</label>
              <input
                value={form.serialNumber}
                onChange={e => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition"
                placeholder="SN-XXXXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Acquisition Cost ($)</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.acquisitionCost}
                onChange={e => setForm({ ...form, acquisitionCost: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition"
                placeholder="1200.00"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Acquisition Date</label>
              <input
                required
                type="date"
                value={form.acquisitionDate}
                onChange={e => setForm({ ...form, acquisitionDate: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm({ ...form, condition: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Location</label>
              <input
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition"
                placeholder="e.g. HQ Room 101"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isBookable"
              checked={form.isBookable}
              onChange={e => setForm({ ...form, isBookable: e.target.checked })}
              className="h-4 w-4 rounded border-slate-800 bg-[#161619] text-emerald-500 focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="isBookable" className="text-slate-400 select-none">Mark as Bookable Resource</label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-5 py-2.5 hover:bg-[#161619] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-[#09090b] font-semibold hover:bg-emerald-400 disabled:opacity-50 transition"
            >
              {loading ? 'Registering...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function BookResourceModal({ isOpen, onClose, onSuccess, currentUser }: ModalProps) {
  const [bookableAssets, setBookableAssets] = useState<Asset[]>([])
  const [form, setForm] = useState({
    assetId: '',
    startTime: '',
    endTime: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/assets?isBookable=true`)
        if (res.ok) {
          const all: Asset[] = await res.json()
          // Only show Available assets for booking
          setBookableAssets(all.filter(a => a.status === 'Available'))
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchAssets()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!currentUser) {
      setError('You must be signed in to book resources')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: form.assetId,
          bookedBy: currentUser.id,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString()
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'BookingOverlap') {
          throw new Error('Overlap error: This resource is already booked during the selected time.')
        }
        throw new Error(data.error || data.message || 'Failed to book resource')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f0f11] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-semibold tracking-wide text-cyan-400">Book Resource</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">✖</button>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 text-sm">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Select Resource</label>
            <select
              required
              value={form.assetId}
              onChange={e => setForm({ ...form, assetId: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 transition"
            >
              <option value="">Select Bookable Asset</option>
              {bookableAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetTag})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Start Time</label>
            <input
              required
              type="datetime-local"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">End Time</label>
            <input
              required
              type="datetime-local"
              value={form.endTime}
              onChange={e => setForm({ ...form, endTime: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 transition"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-5 py-2.5 hover:bg-[#161619] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-[#09090b] font-semibold hover:bg-cyan-400 disabled:opacity-50 transition"
            >
              {loading ? 'Confirming...' : 'Book Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function RaiseRequestsModal({ isOpen, onClose, onSuccess, currentUser }: ModalProps) {
  const [requestType, setRequestType] = useState<'Transfer' | 'Maintenance'>('Transfer')
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<Employee[]>([])
  const [form, setForm] = useState({
    assetId: '',
    toHolderId: '', // for transfer
    issueDescription: '', // for maintenance
    priority: 'Medium' // for maintenance
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchData = async () => {
      try {
        const [resAssets, resUsers] = await Promise.all([
          fetch(`${API_BASE}/api/assets`),
          fetch(`${API_BASE}/api/employees`)
        ])
        if (resAssets.ok) setAssets(await resAssets.json())
        if (resUsers.ok) setUsers(await resUsers.json())
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!currentUser) {
      setError('You must be signed in to raise requests')
      setLoading(false)
      return
    }

    try {
      let endpoint = '/api/transfers'
      let body: any = {
        assetId: form.assetId,
        requestedBy: currentUser.id
      }

      if (requestType === 'Transfer') {
        body.toHolderId = form.toHolderId
      } else {
        endpoint = '/api/maintenances'
        body.raisedBy = currentUser.id
        body.issueDescription = form.issueDescription
        body.priority = form.priority
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit request')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter assets depending on request type
  // Transfers can only be done on Allocated assets
  const selectableAssets = requestType === 'Transfer'
    ? assets.filter(a => a.status === 'Allocated')
    : assets

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f0f11] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-semibold tracking-wide text-rose-400">Raise Requests</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">✖</button>
        </div>

        <div className="mt-4 flex rounded-xl border border-slate-800 bg-[#161619] p-1">
          <button
            type="button"
            onClick={() => {
              setRequestType('Transfer')
              setForm({ ...form, assetId: '' })
              setError('')
            }}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition ${
              requestType === 'Transfer' ? 'bg-[#222226] text-rose-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Transfer Asset
          </button>
          <button
            type="button"
            onClick={() => {
              setRequestType('Maintenance')
              setForm({ ...form, assetId: '' })
              setError('')
            }}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition ${
              requestType === 'Maintenance' ? 'bg-[#222226] text-rose-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Maintenance Req
          </button>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 text-sm">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Select Asset</label>
            <select
              required
              value={form.assetId}
              onChange={e => setForm({ ...form, assetId: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
            >
              <option value="">Select Asset</option>
              {selectableAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetTag}) - {a.status}
                </option>
              ))}
            </select>
          </div>

          {requestType === 'Transfer' ? (
            <div>
              <label className="block text-slate-400 font-medium mb-1">Transfer to Employee</label>
              <select
                required
                value={form.toHolderId}
                onChange={e => setForm({ ...form, toHolderId: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
              >
                <option value="">Select Recipient</option>
                {users
                  .filter(u => u.id !== currentUser?.id)
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Issue Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.issueDescription}
                  onChange={e => setForm({ ...form, issueDescription: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
                  placeholder="Describe the issue with the asset..."
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-5 py-2.5 hover:bg-[#161619] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-rose-500 px-5 py-2.5 text-[#09090b] font-semibold hover:bg-rose-400 disabled:opacity-50 transition"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
