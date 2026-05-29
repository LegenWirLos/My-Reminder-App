'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Edit2, Trash2, Check, RotateCcw } from 'lucide-react'
import PriorityBadge from './PriorityBadge'
import ReminderForm from './ReminderForm'

const SNOOZE_OPTIONS = [
  { label: '+5m',  minutes: 5  },
  { label: '+30m', minutes: 30 },
  { label: '+1h',  minutes: 60 },
]

function formatRepeat(repeatType) {
  if (!repeatType || repeatType === 'once') return null
  if (repeatType === 'daily') return 'repeats daily'
  if (repeatType === 'weekly') return 'repeats weekly'
  if (repeatType.startsWith('custom:')) {
    const [, n, unit] = repeatType.split(':')
    return `repeats every ${n} ${unit}`
  }
  return null
}

function formatDateTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ReminderCard({ reminder, onUpdate, onDelete }) {
  const [editing, setEditing]       = useState(false)
  const [notesOpen, setNotesOpen]   = useState(false)
  const [snoozing, setSnoozing]     = useState(false)

  const isOverdue = !reminder.completed && new Date(reminder.nextTriggerAt) < new Date()

  async function handleSnooze(minutes) {
    setSnoozing(true)
    const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString()
    await onUpdate(reminder.id, { nextTriggerAt: newTime })
    setSnoozing(false)
  }

  async function handleComplete() {
    await onUpdate(reminder.id, { completed: !reminder.completed })
  }

  if (editing) {
    return (
      <ReminderForm
        initial={reminder}
        onSave={async (data) => { await onUpdate(reminder.id, data); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border p-4 card-enter transition-all
      ${isOverdue
        ? 'border-rose-300 overdue-pulse'
        : reminder.completed
          ? 'border-slate-100 opacity-60'
          : 'border-violet-100 hover:shadow-md hover:-translate-y-0.5'}
    `}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleComplete}
          className={`shrink-0 w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all min-h-[24px] ${
            reminder.completed
              ? 'bg-violet-500 border-violet-500'
              : 'border-slate-300 hover:border-violet-400'
          }`}
          title={reminder.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {reminder.completed && <Check size={12} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm ${reminder.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {reminder.title}
            </span>
            <PriorityBadge priority={reminder.priority} />
          </div>

          <div className="flex items-center gap-1 mt-1">
            <Clock size={12} className={isOverdue ? 'text-rose-400' : 'text-slate-400'} />
            <span className={`text-xs ${isOverdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
              {isOverdue ? 'Overdue · ' : ''}{formatDateTime(reminder.nextTriggerAt)}
              {formatRepeat(reminder.repeatType) && (
                <span className="ml-1 text-violet-400">· {formatRepeat(reminder.repeatType)}</span>
              )}
            </span>
          </div>

          {reminder.notes && (
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="flex items-center gap-1 mt-2 text-xs text-violet-500 hover:text-violet-700 transition-colors"
            >
              {notesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {notesOpen ? 'Hide notes' : 'Show notes'}
            </button>
          )}
          {notesOpen && reminder.notes && (
            <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed">
              {reminder.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {!reminder.completed && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
          <RotateCcw size={12} className="text-slate-300" />
          <span className="text-xs text-slate-400">Snooze:</span>
          {SNOOZE_OPTIONS.map((opt) => (
            <button
              key={opt.minutes}
              onClick={() => handleSnooze(opt.minutes)}
              disabled={snoozing}
              className="px-2.5 py-1 text-xs rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 disabled:opacity-40 transition-colors min-h-[28px]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
