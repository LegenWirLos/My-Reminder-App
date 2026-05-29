'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const PRIORITIES = [
  { value: 'urgent', label: '🔴 Urgent' },
  { value: 'normal', label: '🟣 Normal' },
  { value: 'low',    label: '⚪ Low'    },
]

const REPEAT_TYPES = [
  { value: 'once',   label: 'Just once'  },
  { value: 'daily',  label: 'Every day'  },
  { value: 'weekly', label: 'Every week' },
  { value: 'custom', label: 'Custom'     },
]

export default function ReminderForm({ initial, onSave, onCancel }) {
  function toLocalDatetimeValue(isoString) {
    if (!isoString) return ''
    const d = new Date(isoString)
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60 * 1000)
    return local.toISOString().slice(0, 16)
  }

  // if editing a custom reminder, unpack "custom:2:days" back into separate state
  const initRepeat = initial?.repeatType ?? 'once'
  const isCustomInit = initRepeat.startsWith('custom:')
  const [initN, initUnit] = isCustomInit ? initRepeat.split(':').slice(1) : ['2', 'days']

  const [title, setTitle]                   = useState(initial?.title ?? '')
  const [notes, setNotes]                   = useState(initial?.notes ?? '')
  const [datetime, setDatetime]             = useState(toLocalDatetimeValue(initial?.nextTriggerAt) ?? '')
  const [repeatType, setRepeatType]         = useState(isCustomInit ? 'custom' : initRepeat)
  const [customInterval, setCustomInterval] = useState(initN)
  const [customUnit, setCustomUnit]         = useState(initUnit)
  const [priority, setPriority]             = useState(initial?.priority ?? 'normal')
  const [error, setError]                   = useState('')
  const [loading, setLoading]               = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) { setError('Title is required.'); return }
    if (!datetime)     { setError('Date and time are required.'); return }
    if (repeatType === 'custom' && (!customInterval || Number(customInterval) < 1)) {
      setError('Enter a valid interval for custom repeat.')
      return
    }

    const effectiveRepeatType = repeatType === 'custom'
      ? `custom:${customInterval}:${customUnit}`
      : repeatType

    setLoading(true)
    try {
      await onSave({
        title: title.trim(),
        notes,
        nextTriggerAt: new Date(datetime).toISOString(),
        repeatType: effectiveRepeatType,
        priority,
      })
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-violet-100 p-5 mb-4 card-enter">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">
          {initial ? 'Edit reminder' : 'New reminder'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to remember?"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra details… (optional)"
            rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">When *</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Repeat</label>
          <div className="flex gap-2">
            {REPEAT_TYPES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRepeatType(r.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all min-h-[36px] ${
                  repeatType === r.value
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {repeatType === 'custom' && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <span className="text-xs text-slate-500">Every</span>
              <input
                type="number"
                min="1"
                max="99"
                value={customInterval}
                onChange={(e) => setCustomInterval(e.target.value)}
                className="w-14 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
              >
                <option value="hours">hours</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {loading ? 'Saving…' : (initial ? 'Save changes' : 'Add reminder')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
