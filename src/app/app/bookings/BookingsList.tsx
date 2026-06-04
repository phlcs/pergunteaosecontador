'use client'

import { useState } from 'react'
import Link from 'next/link'

type Payment = {
  id: string
  amountCents: number
  status: string
}

type Booking = {
  id: string
  scheduledAt: string
  status: string
  meetUrl: string | null
  payment: Payment | null
}

type Props = {
  bookings: Booking[]
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Concluída',
}

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'bkl-status-pending',
  CONFIRMED: 'bkl-status-confirmed',
  CANCELLED: 'bkl-status-cancelled',
  COMPLETED: 'bkl-status-completed',
}

function fmtBR(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  })
}

export default function BookingsList({ bookings: initial }: Props) {
  const [bookings, setBookings] = useState(initial)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isCancellable = (b: Booking) => {
    const future = new Date(b.scheduledAt) > new Date()
    return future && (b.status === 'PENDING' || b.status === 'CONFIRMED')
  }

  const cancel = async (id: string) => {
    setCancelling(id)
    setError(null)
    setConfirmId(null)
    try {
      const res = await fetch(`/api/booking/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Não foi possível cancelar')
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar')
    } finally {
      setCancelling(null)
    }
  }

  const upcoming = bookings.filter(
    (b) => new Date(b.scheduledAt) >= new Date() && b.status !== 'CANCELLED'
  )
  const past = bookings.filter(
    (b) => new Date(b.scheduledAt) < new Date() || b.status === 'CANCELLED'
  )

  if (bookings.length === 0) {
    return (
      <div className="bkl-empty">
        <div className="bkl-empty-icon">📅</div>
        <p>Você ainda não tem nenhum agendamento.</p>
        <Link href="/app/chat" className="bkl-empty-cta">
          Falar com o assistente →
        </Link>
      </div>
    )
  }

  return (
    <div className="bkl-wrap">
      {error && <div className="bkl-error">{error}</div>}

      {upcoming.length > 0 && (
        <section>
          <h2 className="bkl-section-title">Próximas sessões</h2>
          <div className="bkl-list">
            {upcoming.map((b) => (
              <div key={b.id} className="bkl-item">
                <div className="bkl-item-head">
                  <div>
                    <div className="bkl-item-date">{fmtBR(b.scheduledAt)}</div>
                    <div className="bkl-item-with">Sessão 1h · Rafael · Google Meet</div>
                  </div>
                  <span className={`bkl-status ${STATUS_CLASS[b.status] ?? ''}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>

                {b.meetUrl && b.status === 'CONFIRMED' && (
                  <a href={b.meetUrl} target="_blank" rel="noopener noreferrer" className="bkl-meet-link">
                    Abrir Google Meet →
                  </a>
                )}

                {isCancellable(b) && (
                  confirmId === b.id ? (
                    <div className="bkl-confirm-row">
                      <span>Confirma o cancelamento?</span>
                      <button
                        className="bkl-btn-cancel-yes"
                        onClick={() => cancel(b.id)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id ? 'Cancelando...' : 'Sim, cancelar'}
                      </button>
                      <button className="bkl-btn-cancel-no" onClick={() => setConfirmId(null)}>
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bkl-btn-cancel"
                      onClick={() => setConfirmId(b.id)}
                      disabled={!!cancelling}
                    >
                      Cancelar sessão
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="bkl-section-title">Histórico</h2>
          <div className="bkl-list">
            {past.map((b) => (
              <div key={b.id} className={`bkl-item bkl-item-past`}>
                <div className="bkl-item-head">
                  <div>
                    <div className="bkl-item-date">{fmtBR(b.scheduledAt)}</div>
                    <div className="bkl-item-with">Sessão 1h · Rafael · Google Meet</div>
                  </div>
                  <span className={`bkl-status ${STATUS_CLASS[b.status] ?? ''}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
