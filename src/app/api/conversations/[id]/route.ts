import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getPayload() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const convo = await prisma.conversation.findUnique({ where: { id } })
  if (!convo || convo.userId !== payload.sub) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.message.deleteMany({ where: { conversationId: id } })
  await prisma.conversation.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
