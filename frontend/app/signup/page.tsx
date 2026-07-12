"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Sign up failed");
      }

      localStorage.setItem("assetflow_token", data.token);
      window.dispatchEvent(new Event("assetflow-auth"));
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative">
        {/* Glow decorative element matching the design system brand */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-emerald-100 via-emerald-50 to-transparent opacity-40 blur-3xl -mt-20"></div>
        <div className="p-8 relative z-10">
          <div className="flex flex-col items-center mb-8">
            {/* AssetFlow Brand Logo Box */}
            <div className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-50 mb-6 shrink-0 flex items-center justify-center">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-600"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="p-0">
              <h2 className="text-2xl font-bold text-slate-900 text-center tracking-tight">
                Create an Account
              </h2>
              <p className="text-center text-slate-500 mt-1.5 text-sm">
                Join AssetFlow to manage your business operations
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-0">
            <div className="space-y-1 text-left">
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={update("name")}
                className="bg-slate-50/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full px-3.5 py-2 text-sm transition-all duration-200"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="bg-slate-50/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full px-3.5 py-2 text-sm transition-all duration-200"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={update("password")}
                  className="bg-slate-50/50 border border-slate-200 text-slate-900 pr-12 h-12 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full px-3.5 py-2 text-sm transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-colors h-9 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  className="bg-slate-50/50 border border-slate-200 text-slate-900 pr-12 h-12 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full px-3.5 py-2 text-sm transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-colors h-9 px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
                {error}
              </p>
            ) : null}

            {/* Custom Brand Button: Emerald primary */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-emerald-100 active:scale-[0.98] inline-flex items-center justify-center whitespace-nowrap text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <div className="p-0 mt-6">
            <p className="text-sm text-center text-slate-500 w-full">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
