import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const { pathname } = req.nextUrl

  const isAuthenticated = token ? verifyToken(token) !== null : false

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/app', req.url))
  }

  if (pathname === '/app/chat' || pathname.startsWith('/app/chat/')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/app') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/app/:path*'],
}
