import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = 'auth_token'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export type JwtPayload = {
  sub: string
  email: string
  name: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function cookieOptions(maxAge = MAX_AGE) {
  return [
    `${COOKIE_NAME}=`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ]
}

export function makeAuthCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ')
}

export function makeClearCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'Max-Age=0',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ].join('; ')
}

export { COOKIE_NAME }
