import { createClient } from '@libsql/client'
import path from 'path'

// in dev: uses a local reminders.db file
// in production: TURSO_CONNECTION_URL + TURSO_AUTH_TOKEN point to Turso cloud
const DB_URL = process.env.TURSO_CONNECTION_URL || `file:${path.join(process.cwd(), 'reminders.db')}`

let _db = null

async function initDb() {
  if (!globalThis._reminderDb) {
    globalThis._reminderDb = createClient({
      url: DB_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    await globalThis._reminderDb.execute(`
      CREATE TABLE IF NOT EXISTS reminders (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        title        TEXT NOT NULL,
        notes        TEXT DEFAULT '',
        nextTriggerAt TEXT NOT NULL,
        repeatType   TEXT DEFAULT 'once',
        priority     TEXT DEFAULT 'normal',
        completed    INTEGER DEFAULT 0,
        createdAt    TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const safeAlter = async (sql) => {
      try { await globalThis._reminderDb.execute(sql) } catch {}
    }
    await safeAlter("ALTER TABLE reminders ADD COLUMN notes TEXT DEFAULT ''")
    await safeAlter("ALTER TABLE reminders ADD COLUMN priority TEXT DEFAULT 'normal'")
    await safeAlter("ALTER TABLE reminders ADD COLUMN completed INTEGER DEFAULT 0")
    await safeAlter("ALTER TABLE reminders ADD COLUMN createdAt TEXT DEFAULT CURRENT_TIMESTAMP")
  }

  return globalThis._reminderDb
}

export async function getDb() {
  if (!_db) _db = await initDb()
  return _db
}
