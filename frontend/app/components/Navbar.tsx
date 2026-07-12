"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./ui";

const links = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Roles", href: "#roles" },
  { label: "Modules", href: "#modules" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('assetflow_token')
        if (!token) {
          setUser(null)
          return
        }

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          setUser(null)
          return
        }

        const data = await res.json()
        setUser(data.user ?? null)
      } catch (e) {
        setUser(null)
      }
    }

    loadUser()

    const handler = () => loadUser()
    window.addEventListener('assetflow-auth', handler)
    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('assetflow-auth', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="flex w-full max-w-6xl items-center justify-between rounded-full border border-border bg-card/80 px-3 py-2 pl-5 backdrop-blur-md">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-bg">
            <Icon name="activity" className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">AssetFlow</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA / User + mobile toggle */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-full bg-purple-600 text-white"
                aria-label="User menu"
              >
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </button>

              {userMenuOpen ? (
                <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      localStorage.removeItem('assetflow_token')
                      window.dispatchEvent(new Event('assetflow-auth'))
                      setUser(null)
                      setUserMenuOpen(false)
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <a
              href="/login"
              className="hidden rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:inline-block"
            >
              Launch Dashboard
            </a>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink md:hidden"
            aria-label="Toggle menu"
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 top-20 rounded-2xl border border-border bg-card p-2 shadow-lg md:hidden"
          >
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm text-muted hover:bg-[var(--hover)] hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl bg-ink px-4 py-3 text-center text-sm font-medium text-bg"
                >
                  Launch Dashboard
                </a>
              </li>
              {user ? (
                <li>
                  <a
                    href="#"
                    onClick={() => {
                      localStorage.removeItem('assetflow_token')
                      window.dispatchEvent(new Event('assetflow-auth'))
                      setOpen(false)
                    }}
                    className="mt-1 block rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
                  >
                    Logout
                  </a>
                </li>
              ) : null}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
