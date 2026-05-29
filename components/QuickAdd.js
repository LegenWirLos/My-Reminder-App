'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'

export default function QuickAdd({ onAdd }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const title = value.trim()
    if (!title) return

    setLoading(true)
    const in30min = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    await onAdd({ title, notes: '', nextTriggerAt: in30min, repeatType: 'once', priority: 'normal' })
    setValue('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-violet-100 px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
        <Zap size={16} className="text-violet-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Quick reminder — press Enter to add in 30 min…"
          className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim() || loading}
        className="px-4 py-3 bg-violet-600 text-white rounded-2xl text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
      >
        {loading ? '…' : 'Add'}
      </button>
    </form>
  )
}
