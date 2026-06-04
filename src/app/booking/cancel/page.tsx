import Link from 'next/link'

export default function BookingCancelPage() {
  return (
    <div className="bkpage-wrap">
      <div className="bkpage-card">
        <div className="bkpage-check bkpage-check-fail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>

        <h1 className="bkpage-title">Pagamento não processado</h1>
        <p className="bkpage-sub">
          O pagamento foi recusado ou cancelado. Nenhum valor foi cobrado.<br />
          Você pode tentar novamente quando quiser.
        </p>

        <div className="bkpage-actions">
          <Link href="/app/chat" className="bkpage-btn-primary">
            Tentar novamente
          </Link>
          <Link href="/app/bookings" className="bkpage-btn-ghost">
            Ver meus agendamentos
          </Link>
        </div>
      </div>
    </div>
  )
}
