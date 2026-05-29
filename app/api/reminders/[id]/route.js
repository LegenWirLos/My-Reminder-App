import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PATCH(request, { params }) {
  const { id } = await params
  const numId = parseInt(id, 10)
  if (!numId || numId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await request.json()
  const db = await getDb()

  const existing = await db.execute({
    sql: 'SELECT * FROM reminders WHERE id = ?',
    args: [numId],
  })
  if (!existing.rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const cur = existing.rows[0]
  const updated = {
    title:         (body.title !== undefined && body.title.trim()) ? body.title.trim() : cur.title,
    notes:         body.notes         !== undefined ? body.notes        : cur.notes,
    nextTriggerAt: body.nextTriggerAt !== undefined ? body.nextTriggerAt : cur.nextTriggerAt,
    repeatType:    body.repeatType    !== undefined ? body.repeatType   : cur.repeatType,
    priority:      body.priority      !== undefined ? body.priority     : cur.priority,
    completed:     body.completed     !== undefined ? (body.completed ? 1 : 0) : cur.completed,
  }

  await db.execute({
    sql: `UPDATE reminders
          SET title=?, notes=?, nextTriggerAt=?, repeatType=?, priority=?, completed=?
          WHERE id=?`,
    args: [updated.title, updated.notes, updated.nextTriggerAt,
           updated.repeatType, updated.priority, updated.completed, numId],
  })

  const result = await db.execute({
    sql: 'SELECT * FROM reminders WHERE id = ?',
    args: [numId],
  })
  return NextResponse.json(result.rows[0])
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const numId = parseInt(id, 10)
  if (!numId || numId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const db = await getDb()

  const existing = await db.execute({
    sql: 'SELECT id FROM reminders WHERE id = ?',
    args: [numId],
  })
  if (!existing.rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.execute({ sql: 'DELETE FROM reminders WHERE id = ?', args: [numId] })

  return new NextResponse(null, { status: 204 })
}
