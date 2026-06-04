import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BookingsList from './BookingsList'

export default async function BookingsPage() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null
  if (!payload) redirect('/login')

  const bookings = await prisma.booking.findMany({
    where: { userId: payload.sub },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { scheduledAt: 'desc' },
  })

  const serialized = bookings.map((b) => ({
    id: b.id,
    scheduledAt: b.scheduledAt.toISOString(),
    status: b.status,
    meetUrl: b.meetUrl,
    payment: b.payments[0]
      ? { id: b.payments[0].id, amountCents: b.payments[0].amountCents, status: b.payments[0].status }
      : null,
  }))

  const initials = payload.name
    .split(/\s+/)
    .map((w: string) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="bkpage-app">
      {/* Header identical to chat */}
      <header className="chat-topbar">
        <div className="chat-topbar-left">
          <a href="/" className="chat-brand" title="Voltar ao site">
            <div className="chat-brand-icon">?</div>
            <div className="chat-brand-text">
              <span className="chat-brand-pre">Pergunte ao seu</span>
              <strong>Contador</strong>
            </div>
          </a>
        </div>
        <div className="chat-topbar-right">
          <Link href="/app/chat" className="chat-nav-link">Assistente</Link>
          <Link href="/app/bookings" className="chat-nav-link chat-nav-link-active">Agendamentos</Link>
          <div className="chat-topbar-div" />
          <div className="chat-user-chip">
            <div className="chat-user-av">{initials}</div>
            <div className="chat-user-meta">
              <span className="chat-user-name">{payload.name}</span>
              <span className="chat-user-state">Conectado</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bkpage-content">
        <div className="bkpage-content-inner">
          <div className="bkpage-content-head">
            <div>
              <h1 className="bkpage-content-title">Meus agendamentos</h1>
              <p className="bkpage-content-sub">Gerencie suas sessões com o Rafael.</p>
            </div>
            <Link href="/app/chat" className="bkl-new-btn">
              + Agendar nova sessão
            </Link>
          </div>
          <BookingsList bookings={serialized} />
        </div>
      </div>
    </div>
  )
}
