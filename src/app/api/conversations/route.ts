import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getPayload() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

function getPreview(role: string, content: unknown): string {
  const c = content as Record<string, unknown>
  if (role === 'USER') return String(c.text ?? '').slice(0, 60)
  if (Array.isArray(c.paragraphs)) return String(c.paragraphs[0] ?? '').slice(0, 60)
  return ''
}

export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await prisma.conversation.findMany({
    where: { userId: payload.sub },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  return NextResponse.json(
    rows.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt.getTime(),
      preview: c.messages[0] ? getPreview(c.messages[0].role, c.messages[0].content) : '',
    }))
  )
}

export async function POST() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const convo = await prisma.conversation.create({
    data: { userId: payload.sub, title: 'Nova conversa' },
  })

  return NextResponse.json({
    id: convo.id,
    title: convo.title,
    updatedAt: convo.updatedAt.getTime(),
    preview: '',
  })
}
