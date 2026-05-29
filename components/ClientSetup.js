'use client'

import { useEffect } from 'react'

export default function ClientSetup({ reminders = [], notifEnabled = false }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])

  // check every 30s and fire a notification for anything that's due
  useEffect(() => {
    if (!notifEnabled || Notification.permission !== 'granted') return

    const notified = new Set()

    const check = () => {
      const now = Date.now()
      reminders.forEach((r) => {
        if (r.completed) return
        const due = new Date(r.nextTriggerAt).getTime()
        if (due <= now && !notified.has(r.id)) {
          notified.add(r.id)
          new Notification(`⏰ ${r.title}`, {
            body: r.notes || 'Reminder is due!',
            icon: '/icon-192.png',
          })
        }
      })
    }

    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [reminders, notifEnabled])

  return null
}
