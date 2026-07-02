import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  verifyToken,
  COOKIE_NAME,
  ANON_COOKIE_NAME,
  readAnonId,
  makeAnonId,
  makeAnonCookie,
} from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatComplete } from '@/lib/ai'
import { validateInput } from '@/lib/ai/validate-input'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'
import { FALLBACK_RESPONSE, BLOCKED_RESPONSE, type AiResponse } from '@/lib/ai/schema'
import { checkRateLimit, checkAnonRateLimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'

type HistoryMessage = { role: 'user' | 'assistant'; content: string }

const MAX_HISTORY = 6

function parseClientHistory(raw: unknown): HistoryMessage[] {
  if (!Array.isArray(raw)) return []
  const out: HistoryMessage[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const it = item as { role?: unknown; content?: unknown }
    if ((it.role === 'user' || it.role === 'assistant') && typeof it.content === 'string') {
      out.push({ role: it.role, content: it.content })
    }
  }
  return out.slice(-MAX_HISTORY)
}

/* ----------------------------------------------------------------
   Helpers
   ---------------------------------------------------------------- */

function extractIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}

function makeFingerprint(ip: string, userAgent: string): string {
  return createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex')
    .slice(0, 16)
}

function makeTitle(text: string): string {
  return text.slice(0, 40) + (text.length > 40 ? '…' : '')
}

/* ----------------------------------------------------------------
   Shared conversation + message persistence
   Returns null if the conversation is not owned by userId
   ---------------------------------------------------------------- */

async function persistMessages(
  userId: string,
  conversationId: string | null,
  userText: string,
  assistantContent: AiResponse
): Promise<{
  convoId: string
  userMsgId: string
  assistantMsgId: string
} | null> {
  let convoId = conversationId

  if (!convoId) {
    const convo = await prisma.conversation.create({
      data: { userId, title: makeTitle(userText) },
    })
    convoId = convo.id
  } else {
    const convo = await prisma.conversation.findUnique({ where: { id: convoId } })
    if (!convo || convo.userId !== userId) return null
    if (convo.title === 'Nova conversa') {
      await prisma.conversation.update({
        where: { id: convoId },
        data: { title: makeTitle(userText) },
      })
    }
  }

  const [userMsg, assistantMsg] = await Promise.all([
    prisma.message.create({
      data: {
        conversationId: convoId,
        role: 'USER',
        content: { text: userText },
      },
    }),
    prisma.message.create({
      data: {
        conversationId: convoId,
        role: 'ASSISTANT',
        content: assistantContent as unknown as Parameters<
          typeof prisma.message.create
        >[0]['data']['content'],
      },
    }),
  ])

  await prisma.conversation.update({
    where: { id: convoId },
    data: { updatedAt: new Date() },
  })

  return { convoId, userMsgId: userMsg.id, assistantMsgId: assistantMsg.id }
}

/* ----------------------------------------------------------------
   Route handler
   ---------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  // 1. Auth — se tem token válido segue fluxo logado; senão desvia pra anônimo
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    const anonCookieValue = cookieStore.get(ANON_COOKIE_NAME)?.value
    return handleAnon(req, anonCookieValue)
  }

  // 2. Parse body
  let body: { message?: unknown; conversationId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message, conversationId } = body as {
    message: string | null
    conversationId: string | null
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const text = message.trim()

  // 3. Extract IP + fingerprint
  const ip = extractIp(req)
  const fingerprint = makeFingerprint(ip, req.headers.get('user-agent') ?? '')

  // 4. Validate input — blocked messages skip rate limit and LLM,
  //    but are still persisted so the user sees the response in context
  const inputCheck = validateInput(text)
  if (!inputCheck.ok) {
    const result = await persistMessages(payload.sub, conversationId ?? null, text, BLOCKED_RESPONSE)
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      conversationId: result.convoId,
      userMessageId: result.userMsgId,
      assistantMessageId: result.assistantMsgId,
      response: BLOCKED_RESPONSE,
    })
  }

  // 5. Rate limit
  let rateResult
  try {
    rateResult = await checkRateLimit({ userId: payload.sub, ip, fingerprint })
  } catch (err) {
    logger.error('chat/send: rate limit check failed — failing open', { userId: payload.sub, error: err instanceof Error ? err.message : String(err) })
    // If Redis is unavailable, fail open (allow the request)
    rateResult = { ok: true as const }
  }

  if (!rateResult.ok) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        reason: rateResult.reason,
        retryAfterSeconds: 'retryAfterSeconds' in rateResult ? rateResult.retryAfterSeconds : undefined,
      },
      { status: 429 }
    )
  }

  // 6. Create / verify conversation
  let convoId = conversationId ?? null
  if (!convoId) {
    const convo = await prisma.conversation.create({
      data: { userId: payload.sub, title: makeTitle(text) },
    })
    convoId = convo.id
  } else {
    const convo = await prisma.conversation.findUnique({ where: { id: convoId } })
    if (!convo || convo.userId !== payload.sub) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (convo.title === 'Nova conversa') {
      await prisma.conversation.update({
        where: { id: convoId },
        data: { title: makeTitle(text) },
      })
    }
  }

  // 7. Persist user message
  const userMsg = await prisma.message.create({
    data: {
      conversationId: convoId,
      role: 'USER',
      content: { text },
    },
  })

  // 8. Load last 6 messages for history (excluding the one we just created)
  const recentMessages = await prisma.message.findMany({
    where: { conversationId: convoId, id: { not: userMsg.id } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const history = recentMessages
    .reverse()
    .map((msg) => {
      if (msg.role === 'USER') {
        const c = msg.content as { text?: string }
        return { role: 'user' as const, content: c.text ?? '' }
      }
      return { role: 'assistant' as const, content: JSON.stringify(msg.content) }
    })

  // 9. Call LLM
  let aiResponse: AiResponse
  try {
    aiResponse = await chatComplete({ systemPrompt: SYSTEM_PROMPT, history, userMessage: text })
  } catch (err) {
    logger.error('chat/send: chatComplete threw unexpectedly', { userId: payload.sub, error: err instanceof Error ? err.message : String(err) })
    aiResponse = FALLBACK_RESPONSE
  }

  // 10. Persist assistant message
  const assistantMsg = await prisma.message.create({
    data: {
      conversationId: convoId,
      role: 'ASSISTANT',
      content: aiResponse as unknown as Parameters<
        typeof prisma.message.create
      >[0]['data']['content'],
    },
  })

  // 11. Update conversation timestamp
  await prisma.conversation.update({
    where: { id: convoId },
    data: { updatedAt: new Date() },
  })

  // 12. UsageLog
  await prisma.usageLog.create({
    data: {
      userId: payload.sub,
      ip,
      fingerprint,
      action: 'chat',
    },
  })

  // 13. Return
  return NextResponse.json({
    conversationId: convoId,
    userMessageId: userMsg.id,
    assistantMessageId: assistantMsg.id,
    response: aiResponse,
  })
}

/* ----------------------------------------------------------------
   Anonymous flow — 2 perguntas grátis por cookie, sem persistência.
   History vem do body (cap 6). Rate limit fail-closed.
   ---------------------------------------------------------------- */

async function handleAnon(
  req: NextRequest,
  anonCookieValue: string | undefined
): Promise<NextResponse> {
  // 1. Resolve / issue anonId
  let anonId = anonCookieValue ? readAnonId(anonCookieValue) : null
  let anonCookieToSet: string | null = null
  if (!anonId) {
    anonId = makeAnonId()
    anonCookieToSet = makeAnonCookie(anonId)
  }

  const attachCookie = (res: NextResponse): NextResponse => {
    if (anonCookieToSet) res.headers.set('Set-Cookie', anonCookieToSet)
    return res
  }

  // 2. Parse body
  let body: { message?: unknown; history?: unknown }
  try {
    body = await req.json()
  } catch {
    return attachCookie(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }))
  }

  const { message, history: rawHistory } = body as {
    message: unknown
    history: unknown
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return attachCookie(NextResponse.json({ error: 'message is required' }, { status: 400 }))
  }

  const text = message.trim()

  // 3. IP + fingerprint
  const ip = extractIp(req)
  const fingerprint = makeFingerprint(ip, req.headers.get('user-agent') ?? '')

  // 4. Validate input (anti-injection). Blocked → BLOCKED_RESPONSE sem consumir cota.
  const inputCheck = validateInput(text)
  if (!inputCheck.ok) {
    return attachCookie(
      NextResponse.json({
        conversationId: null,
        userMessageId: null,
        assistantMessageId: null,
        response: BLOCKED_RESPONSE,
      })
    )
  }

  // 5. Rate limit (fail-closed pro anônimo)
  const rateResult = await checkAnonRateLimit({ anonId, ip })
  if (!rateResult.ok) {
    return attachCookie(
      NextResponse.json(
        {
          error: 'rate_limited',
          reason: rateResult.reason,
          retryAfterSeconds:
            'retryAfterSeconds' in rateResult ? rateResult.retryAfterSeconds : undefined,
        },
        { status: 429 }
      )
    )
  }

  // 6. History vem do cliente (contexto de sessão), cap 6
  const history = parseClientHistory(rawHistory)

  // 7. Call LLM
  let aiResponse: AiResponse
  try {
    aiResponse = await chatComplete({ systemPrompt: SYSTEM_PROMPT, history, userMessage: text })
  } catch (err) {
    logger.error('chat/send: chatComplete threw unexpectedly (anon)', {
      anonId,
      error: err instanceof Error ? err.message : String(err),
    })
    aiResponse = FALLBACK_RESPONSE
  }

  // 8. UsageLog (telemetria opcional — não persistimos Conversation/Message)
  try {
    await prisma.usageLog.create({
      data: { userId: null, ip, fingerprint, action: 'chat_anon' },
    })
  } catch (err) {
    logger.warn('chat/send: usageLog (anon) failed — ignoring', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  // 9. Return (mesmo shape do logado; ids nulos porque não persistiu)
  return attachCookie(
    NextResponse.json({
      conversationId: null,
      userMessageId: null,
      assistantMessageId: null,
      response: aiResponse,
    })
  )
}
