'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import QuickAdd from '@/components/QuickAdd'
import ReminderForm from '@/components/ReminderForm'
import ReminderCard from '@/components/ReminderCard'
import OverdueBanner from '@/components/OverdueBanner'
import ClientSetup from '@/components/ClientSetup'
import { Bell } from 'lucide-react'

export default function HomePage() {
  const [reminders, setReminders]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [error, setError]               = useState('')

  const overdueReminders = reminders.filter(
    (r) => !r.completed && new Date(r.nextTriggerAt) < new Date()
  )

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch('/api/reminders')
      if (!res.ok) throw new Error('Failed to load reminders')
      const data = await res.json()
      setReminders(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReminders() }, [fetchReminders])

  useEffect(() => {
    const id = setInterval(() => setReminders((r) => [...r]), 60_000)
    return () => clearInterval(id)
  }, [])

  async function handleAdd(data) {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Could not create reminder')
    }
    const created = await res.json()
    setReminders((prev) => [created, ...prev])
    setShowForm(false)
  }

  async function handleUpdate(id, patch) {
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) return
    const updated = await res.json()
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }

  async function handleDelete(id) {
    await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  async function handleToggleNotif() {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.')
      return
    }
    if (Notification.permission === 'denied') {
      alert('Notifications are blocked. Please allow them in your browser settings.')
      return
    }
    if (!notifEnabled) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') setNotifEnabled(true)
    } else {
      setNotifEnabled(false)
    }
  }

  const activeReminders    = reminders.filter((r) => !r.completed)
  const completedReminders = reminders.filter((r) => r.completed)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <ClientSetup reminders={reminders} notifEnabled={notifEnabled} />

      <Header
        overdueCount={overdueReminders.length}
        notifEnabled={notifEnabled}
        onToggleNotif={handleToggleNotif}
        onNewReminder={() => setShowForm(true)}
      />

      <OverdueBanner overdueReminders={overdueReminders} />

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-4 py-3">
          {error}
        </div>
      )}

      <QuickAdd onAdd={handleAdd} />

      {showForm && (
        <ReminderForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-sm">Loading your reminders…</p>
        </div>
      ) : (
        <>
          {activeReminders.length === 0 && !showForm ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-medium text-slate-500">No reminders yet!</p>
              <p className="text-sm mt-1">Use the quick-add bar or hit &quot;New&quot; to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {completedReminders.length > 0 && (
            <details className="mt-8">
              <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-600 select-none mb-3">
                Completed ({completedReminders.length})
              </summary>
              <div className="space-y-3">
                {completedReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {!notifEnabled && reminders.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleToggleNotif}
            className="inline-flex items-center gap-2 text-sm text-violet-500 hover:text-violet-700 transition-colors"
          >
            <Bell size={14} />
            Enable notifications so you never miss a reminder
          </button>
        </div>
      )}
    </main>
  )
}
