import { NextResponse } from 'next/server'

// runs before every request — checks for a valid auth cookie
// public paths that don't need a login
const PUBLIC = ['/login', '/api/auth']

async function tokenFor(password) {
  const data = new TextEncoder().encode('reminders_v1:' + password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('reminders_auth')?.value
  const expected = await tokenFor(process.env.APP_PASSWORD || '')

  if (cookie !== expected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icon).*)'],
}
