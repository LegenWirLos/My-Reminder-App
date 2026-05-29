'use client'

import { AlertTriangle } from 'lucide-react'

export default function OverdueBanner({ overdueReminders }) {
  if (!overdueReminders.length) return null

  return (
    <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
      <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
      <div>
        <p className="text-rose-700 font-semibold text-sm">
          {overdueReminders.length === 1
            ? '1 reminder is overdue!'
            : `${overdueReminders.length} reminders are overdue!`}
        </p>
        <ul className="mt-1 space-y-0.5">
          {overdueReminders.map((r) => (
            <li key={r.id} className="text-rose-600 text-xs">
              • {r.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
