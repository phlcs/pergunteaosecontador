import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const { pathname } = req.nextUrl

  const isAuthenticated = token ? verifyToken(token) !== null : false

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname === '/' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login'],
}
