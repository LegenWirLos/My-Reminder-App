import { NextResponse } from 'next/server'

async function tokenFor(password) {
  const data = new TextEncoder().encode('reminders_v1:' + password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request) {
  const { password } = await request.json()

  console.log('APP_PASSWORD set:', !!process.env.APP_PASSWORD, '| length:', process.env.APP_PASSWORD?.length)

  if (!password || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const token = await tokenFor(password)
  const response = NextResponse.json({ ok: true })

  response.cookies.set('reminders_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return response
}
