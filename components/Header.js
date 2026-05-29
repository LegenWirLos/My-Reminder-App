'use client'

import { Bell, BellOff, Plus } from 'lucide-react'

export default function Header({ overdueCount, notifEnabled, onToggleNotif, onNewReminder }) {
  return (
    <header className="bg-gradient-to-r from-violet-600 to-purple-500 rounded-3xl shadow-lg shadow-violet-200 p-6 mb-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ✨ My Reminders
          </h1>
          <p className="text-violet-200 text-sm mt-0.5">
            {overdueCount > 0
              ? `${overdueCount} overdue — check them! 👀`
              : 'All caught up — nice! 🎉'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleNotif}
            title={notifEnabled ? 'Notifications on' : 'Enable notifications'}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>

          <button
            onClick={onNewReminder}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-violet-600 font-semibold text-sm hover:bg-violet-50 transition-colors min-h-[44px]"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>
    </header>
  )
}
