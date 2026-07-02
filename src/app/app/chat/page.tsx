import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ChatPage from './ChatPage'

export default async function ChatRoute({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null
  const params = await searchParams

  // Visitante anônimo — sem histórico do banco, sem autoBook
  if (!payload) {
    return (
      <ChatPage
        user={null}
        initialConversations={[]}
        autoBook={false}
      />
    )
  }

  const rows = await prisma.conversation.findMany({
    where: { userId: payload.sub },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  const initialConversations = rows.map((c) => {
    const last = c.messages[0]
    let preview = ''
    if (last) {
      const content = last.content as Record<string, unknown>
      if (last.role === 'USER') preview = String(content.text ?? '').slice(0, 60)
      else if (Array.isArray(content.paragraphs))
        preview = String(content.paragraphs[0] ?? '').slice(0, 60)
    }
    return { id: c.id, title: c.title, updatedAt: c.updatedAt.getTime(), preview }
  })

  return (
    <ChatPage
      user={{ id: payload.sub, name: payload.name, email: payload.email }}
      initialConversations={initialConversations}
      autoBook={params.action === 'book'}
    />
  )
}
