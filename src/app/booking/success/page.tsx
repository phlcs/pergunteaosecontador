import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

type Props = { searchParams: Promise<{ id?: string }> }

function fmtBR(date: Date): string {
  return date.toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  })
}

export default async function BookingSuccessPage({ searchParams }: Props) {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null
  if (!payload) redirect('/login')

  const { id } = await searchParams
  if (!id) redirect('/app/bookings')

  const booking = await prisma.booking.findFirst({
    where: { id, userId: payload.sub },
  })
  if (!booking) redirect('/app/bookings')

  return (
    <div className="bkpage-wrap">
      <div className="bkpage-card">
        <div className="bkpage-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="bkpage-title">Sessão confirmada!</h1>
        <p className="bkpage-sub">
          Você também receberá um e-mail com todos os detalhes.
        </p>

        <div className="bkpage-details">
          <div className="bkpage-detail-row">
            <span>Quando</span>
            <span>{fmtBR(booking.scheduledAt)}</span>
          </div>
          <div className="bkpage-detail-row">
            <span>Com</span>
            <span>Rafael · CRC ativo</span>
          </div>
          <div className="bkpage-detail-row">
            <span>Onde</span>
            <span>
              {booking.meetUrl ? (
                <a href={booking.meetUrl} target="_blank" rel="noopener noreferrer" className="bkpage-meet-link">
                  Abrir Google Meet →
                </a>
              ) : (
                'Google Meet (link em breve)'
              )}
            </span>
          </div>
          <div className="bkpage-detail-row">
            <span>Valor</span>
            <span>R$ 197 · pago</span>
          </div>
        </div>

        <div className="bkpage-actions">
          <Link href="/app/bookings" className="bkpage-btn-primary">
            Ver meus agendamentos
          </Link>
          <Link href="/app/chat" className="bkpage-btn-ghost">
            Voltar ao assistente
          </Link>
        </div>
      </div>
    </div>
  )
}
