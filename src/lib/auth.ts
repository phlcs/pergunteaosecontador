import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = 'auth_token'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

const ANON_COOKIE_NAME = 'anon_id'
const ANON_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export type JwtPayload = {
  sub: string
  email: string
  name: string
}

export type AnonPayload = {
  anonId: string
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

/* ----------------------------------------------------------------
   Anonymous visitor cookie — signed id, 30d TTL
   ---------------------------------------------------------------- */

export function makeAnonId(): string {
  return randomUUID()
}

export function makeAnonCookie(anonId: string): string {
  const token = jwt.sign({ anonId }, JWT_SECRET, { expiresIn: ANON_MAX_AGE })
  return [
    `${ANON_COOKIE_NAME}=${token}`,
    `Max-Age=${ANON_MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ')
}

export function readAnonId(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AnonPayload
    return typeof payload.anonId === 'string' ? payload.anonId : null
  } catch {
    return null
  }
}

export { COOKIE_NAME, ANON_COOKIE_NAME }
