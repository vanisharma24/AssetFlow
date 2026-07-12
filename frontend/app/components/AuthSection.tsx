'use client'

import { useState } from 'react'

type Mode = 'signup' | 'signin'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AuthSection() {
  const [mode, setMode] = useState<Mode>('signup')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)

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

      setToken(data.token)
      localStorage.setItem('assetflow_token', data.token)
      setMessage({
        type: 'success',
        text: mode === 'signup' ? 'Account created successfully.' : 'Signed in successfully.',
      })
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Auth demo</p>
            <h2 className="text-3xl font-semibold text-slate-900">Sign up or sign in</h2>
          </div>
          <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setMessage(null)
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'signup' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setMessage(null)
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'signin' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign in
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {mode === 'signup' && (
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Full name
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-slate-400"
                placeholder="Jane Doe"
              />
            </label>
          )}

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-slate-400"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-slate-400"
              placeholder="At least 8 characters"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {message.text}
          </p>
        )}

        {token && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Token saved locally</p>
            <p className="mt-1 break-all text-xs text-slate-500">{token}</p>
          </div>
        )}
      </div>
    </section>
  )
}
