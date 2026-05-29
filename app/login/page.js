'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Wrong password, try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-2xl font-bold text-slate-800">My Reminders</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your password to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-violet-100 p-6">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                <Lock size={15} className="text-slate-400 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  className="flex-1 py-2.5 text-sm text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {loading ? 'Checking…' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
