import { getRedis } from './redis'
import { logger } from '@/lib/logger'

const DAILY_GLOBAL_LIMIT = parseInt(process.env.DAILY_GLOBAL_LIMIT ?? '200', 10)
const DAILY_USER_LIMIT = parseInt(process.env.DAILY_USER_LIMIT ?? '5', 10)
const MIN_SECONDS = parseInt(process.env.MIN_SECONDS_BETWEEN_MESSAGES ?? '8', 10)
const ANON_DAILY_LIMIT = parseInt(process.env.ANON_DAILY_LIMIT ?? '2', 10)
const ANON_IP_DAILY_LIMIT = parseInt(process.env.ANON_IP_DAILY_LIMIT ?? '6', 10)

type RateLimitOk = { ok: true }
type RateLimitBlocked =
  | { ok: false; reason: 'user_daily' }
  | { ok: false; reason: 'global_daily' }
  | { ok: false; reason: 'too_fast'; retryAfterSeconds: number }

export type RateLimitResult = RateLimitOk | RateLimitBlocked

type AnonRateLimitBlocked =
  | { ok: false; reason: 'anon_daily' }
  | { ok: false; reason: 'anon_ip' }
  | { ok: false; reason: 'global_daily' }
  | { ok: false; reason: 'too_fast'; retryAfterSeconds: number }
  | { ok: false; reason: 'anon_unavailable' }

export type AnonRateLimitResult = RateLimitOk | AnonRateLimitBlocked

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function checkRateLimit({
  userId,
  ip,
  fingerprint,
}: {
  userId: string
  ip: string
  fingerprint: string
}): Promise<RateLimitResult> {
  const redis = getRedis()
  void ip
  void fingerprint

  const today = todayKey()

  // ── a) Limite global (kill switch) ──────────────────────────────────────────
  const globalKey = `ratelimit:global:${today}`
  const globalPipeline = redis.pipeline()
  globalPipeline.incr(globalKey)
  globalPipeline.expire(globalKey, 86400)
  const globalResults = await globalPipeline.exec()
  const globalCount = (globalResults?.[0]?.[1] as number) ?? 0

  if (globalCount >= DAILY_GLOBAL_LIMIT * 0.5 && globalCount < DAILY_GLOBAL_LIMIT * 0.8) {
    logger.warn('RateLimit: global usage at 50%', { count: globalCount, limit: DAILY_GLOBAL_LIMIT })
  } else if (globalCount >= DAILY_GLOBAL_LIMIT * 0.8 && globalCount < DAILY_GLOBAL_LIMIT) {
    logger.warn('RateLimit: global usage at 80%', { count: globalCount, limit: DAILY_GLOBAL_LIMIT })
  } else if (globalCount >= DAILY_GLOBAL_LIMIT) {
    logger.error('RateLimit: global limit reached — blocking all users', { count: globalCount, limit: DAILY_GLOBAL_LIMIT })
    return { ok: false, reason: 'global_daily' }
  }

  // ── b) Limite por usuário ────────────────────────────────────────────────────
  const userKey = `ratelimit:user:${userId}:${today}`
  const userPipeline = redis.pipeline()
  userPipeline.incr(userKey)
  userPipeline.expire(userKey, 86400)
  const userResults = await userPipeline.exec()
  const userCount = (userResults?.[0]?.[1] as number) ?? 0

  if (userCount > DAILY_USER_LIMIT) {
    // Decrement global counter since we're blocking this user
    await redis.decr(globalKey)
    return { ok: false, reason: 'user_daily' }
  }

  // ── c) Velocidade mínima entre mensagens ────────────────────────────────────
  const lastKey = `ratelimit:lastmsg:${userId}`
  const now = Date.now()
  const lastTs = await redis.get(lastKey)

  if (lastTs) {
    const diffSeconds = (now - parseInt(lastTs, 10)) / 1000
    if (diffSeconds < MIN_SECONDS) {
      // Decrement both counters since we're blocking
      await redis.pipeline().decr(globalKey).decr(userKey).exec()
      return {
        ok: false,
        reason: 'too_fast',
        retryAfterSeconds: Math.ceil(MIN_SECONDS - diffSeconds),
      }
    }
  }

  await redis.set(lastKey, String(now), 'EX', 60)

  return { ok: true }
}

/* ----------------------------------------------------------------
   Anonymous rate limit — cookie id + IP + global + throttle
   Fail-closed: any Redis error blocks with `anon_unavailable`.
   ---------------------------------------------------------------- */

export async function checkAnonRateLimit({
  anonId,
  ip,
}: {
  anonId: string
  ip: string
}): Promise<AnonRateLimitResult> {
  try {
    const redis = getRedis()
    const today = todayKey()

    // ── a) Kill switch global (compartilhado com o fluxo logado) ────────────
    const globalKey = `ratelimit:global:${today}`
    const globalPipeline = redis.pipeline()
    globalPipeline.incr(globalKey)
    globalPipeline.expire(globalKey, 86400)
    const globalResults = await globalPipeline.exec()
    const globalCount = (globalResults?.[0]?.[1] as number) ?? 0

    if (globalCount >= DAILY_GLOBAL_LIMIT * 0.5 && globalCount < DAILY_GLOBAL_LIMIT * 0.8) {
      logger.warn('RateLimit: global usage at 50%', { count: globalCount, limit: DAILY_GLOBAL_LIMIT })
    } else if (globalCount >= DAILY_GLOBAL_LIMIT * 0.8 && globalCount < DAILY_GLOBAL_LIMIT) {
      logger.warn('RateLimit: global usage at 80%', { count: globalCount, limit: DAILY_GLOBAL_LIMIT })
    } else if (globalCount >= DAILY_GLOBAL_LIMIT) {
      logger.error('RateLimit: global limit reached — blocking all users', { count: globalCount, limit: DAILY_GLOBAL_LIMIT })
      return { ok: false, reason: 'global_daily' }
    }

    // ── b) Limite por anonId ────────────────────────────────────────────────
    const anonKey = `ratelimit:anon:${anonId}:${today}`
    const anonPipeline = redis.pipeline()
    anonPipeline.incr(anonKey)
    anonPipeline.expire(anonKey, 86400)
    const anonResults = await anonPipeline.exec()
    const anonCount = (anonResults?.[0]?.[1] as number) ?? 0

    if (anonCount > ANON_DAILY_LIMIT) {
      await redis.decr(globalKey)
      return { ok: false, reason: 'anon_daily' }
    }

    // ── c) Teto por IP (segura quem limpa o cookie) ─────────────────────────
    const ipKey = `ratelimit:ip:${ip}:${today}`
    const ipPipeline = redis.pipeline()
    ipPipeline.incr(ipKey)
    ipPipeline.expire(ipKey, 86400)
    const ipResults = await ipPipeline.exec()
    const ipCount = (ipResults?.[0]?.[1] as number) ?? 0

    if (ipCount > ANON_IP_DAILY_LIMIT) {
      await redis.pipeline().decr(globalKey).decr(anonKey).exec()
      return { ok: false, reason: 'anon_ip' }
    }

    // ── d) Throttle por anonId (reusa MIN_SECONDS) ──────────────────────────
    const lastKey = `ratelimit:lastmsg:anon:${anonId}`
    const now = Date.now()
    const lastTs = await redis.get(lastKey)

    if (lastTs) {
      const diffSeconds = (now - parseInt(lastTs, 10)) / 1000
      if (diffSeconds < MIN_SECONDS) {
        await redis.pipeline().decr(globalKey).decr(anonKey).decr(ipKey).exec()
        return {
          ok: false,
          reason: 'too_fast',
          retryAfterSeconds: Math.ceil(MIN_SECONDS - diffSeconds),
        }
      }
    }

    await redis.set(lastKey, String(now), 'EX', 60)

    return { ok: true }
  } catch (err) {
    logger.error('checkAnonRateLimit: redis error — failing closed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return { ok: false, reason: 'anon_unavailable' }
  }
}
