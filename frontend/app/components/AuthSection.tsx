'use client'

import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Mode = 'signup' | 'signin'

export default function AuthSection() {
  const [mode, setMode] = useState<Mode>('signin') // default to signin for convenience
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body =
        mode === 'signup'
          ? { name: form.name, email: form.email, password: form.password }
          : { email: form.email, password: form.password }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      localStorage.setItem('assetflow_token', data.token)
      // notify other components (Navbar, page) that auth state changed
      try {
        window.dispatchEvent(new Event('assetflow-auth'))
      } catch (e) {
        /* ignore */
      }
      setForm({ name: '', email: '', password: '' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Authentication failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f0f11] p-8 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">AssetFlow</h2>
          <p className="mt-1.5 text-sm text-slate-400">Operations and Asset Tracking Center</p>
        </div>

        <div className="mt-6 flex rounded-xl border border-slate-800 bg-[#161619] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setMessage(null)
            }}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition ${
              mode === 'signin' ? 'bg-[#222226] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setMessage(null)
            }}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition ${
              mode === 'signup' ? 'bg-[#222226] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Full name</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition text-sm"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-[#161619] px-4 py-2.5 text-white outline-none focus:border-emerald-500/50 transition text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-[#09090b] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-center text-sm text-rose-400 border border-rose-500/20">
            {message.text}
          </p>
        )}

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800/60 pt-4">
          Demo accounts:<br />
          <span className="font-semibold text-slate-400">arushi@gmail.com</span> / password123 (Admin)<br />
          <span className="font-semibold text-slate-400">priya@example.com</span> / password123 (IT Dept)
        </div>
      </div>
    </div>
  )
}
