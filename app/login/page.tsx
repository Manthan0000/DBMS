'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Login failed')
        return
      }

      // Redirect based on role
      if (data.data.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (data.data.user.role === 'STUDENT') {
        router.push('/student')
      } else if (data.data.user.role === 'PROFESSOR') {
        router.push('/professor')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div
        className="hidden w-1/2 flex-col justify-end p-10 md:flex"
        style={{ background: '#0f766e' }}
      >
        <div>
          <span
            className="mb-6 inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: '#ffffff', background: 'rgba(255,255,255,0.15)' }}
          >
            IIIT Vadodara
          </span>
          <h1
            className="mb-3 text-[28px] font-bold leading-tight"
            style={{ color: '#ffffff' }}
          >
            College ERP
          </h1>
          <p className="max-w-sm text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Manage students, courses &amp; fees — all in one place.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full items-center justify-center bg-white md:w-1/2">
        <div className="w-full max-w-sm px-6">
          <h2
            className="mb-1 text-2xl font-bold"
            style={{ color: '#0f172a' }}
          >
            Welcome back
          </h2>
          <p className="mb-8 text-sm" style={{ color: '#64748b' }}>
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: '#fff1ec', color: '#9a3412' }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: '#334155' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0d9488'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: '#334155' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0d9488'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: '#0d9488' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
