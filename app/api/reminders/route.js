import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const result = await db.execute(`
    SELECT * FROM reminders
    ORDER BY
      completed ASC,
      CASE priority WHEN 'urgent' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
      nextTriggerAt ASC
  `)
  return NextResponse.json(result.rows)
}

export async function POST(request) {
  const body = await request.json()
  const { title, notes = '', nextTriggerAt, repeatType = 'once', priority = 'normal' } = body

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!nextTriggerAt || isNaN(new Date(nextTriggerAt).getTime())) {
    return NextResponse.json({ error: 'Valid date/time is required' }, { status: 400 })
  }
  const validRepeat = ['once', 'daily', 'weekly'].includes(repeatType) ||
    /^custom:[1-9]\d*:(hours|days|weeks)$/.test(repeatType)
  if (!validRepeat) {
    return NextResponse.json({ error: 'Invalid repeat type' }, { status: 400 })
  }
  if (!['urgent', 'normal', 'low'].includes(priority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
  }

  const db = await getDb()
  const insertResult = await db.execute({
    sql: `INSERT INTO reminders (title, notes, nextTriggerAt, repeatType, priority)
          VALUES (?, ?, ?, ?, ?)`,
    args: [title.trim(), notes, nextTriggerAt, repeatType, priority],
  })

  const inserted = await db.execute({
    sql: 'SELECT * FROM reminders WHERE id = ?',
    args: [Number(insertResult.lastInsertRowid)],
  })

  return NextResponse.json(inserted.rows[0], { status: 201 })
}
