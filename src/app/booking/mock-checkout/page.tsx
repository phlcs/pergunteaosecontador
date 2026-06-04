'use client'

import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function MockCheckoutContent() {
  // Guard: disabled in production or when kiwify is real
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_KIWIFY_MODE === 'real') {
    notFound()
  }

  const router = useRouter()
  const params = useSearchParams()
  const paymentId = params.get('paymentId')
  const amountCents = Number(params.get('amount') ?? 19700)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!paymentId) {
    notFound()
  }

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(amountCents / 100)

  const simulate = async (result: 'approved' | 'refused') => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, result }),
      })
      if (!res.ok) throw new Error('Erro ao processar pagamento')
      const data = await res.json()
      if (result === 'approved') {
        router.push(`/booking/success?id=${data.bookingId}`)
      } else {
        router.push('/booking/cancel')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="mockck-page">
      <div className="mockck-card">
        <div className="mockck-badge">DEV · Simulador de Pagamento</div>
        <div className="mockck-brand">
          <div className="mockck-brand-icon">K</div>
          <span>Kiwify <span className="mockck-mock-tag">mock</span></span>
        </div>

        <div className="mockck-product">
          <div className="mockck-product-name">Sessão 1h com Rafael · Contador</div>
          <div className="mockck-product-price">{priceFormatted}</div>
          <div className="mockck-product-id">payment_id: {paymentId}</div>
        </div>

        <p className="mockck-desc">
          Este é o checkout simulado para desenvolvimento.<br />
          Em produção, esta tela é o formulário real do Kiwify.
        </p>

        {error && <div className="mockck-error">{error}</div>}

        <div className="mockck-actions">
          <button
            className="mockck-btn mockck-btn-approve"
            onClick={() => simulate('approved')}
            disabled={loading}
          >
            {loading ? '...' : '✅  Aprovar pagamento'}
          </button>
          <button
            className="mockck-btn mockck-btn-refuse"
            onClick={() => simulate('refused')}
            disabled={loading}
          >
            {loading ? '...' : '❌  Recusar pagamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MockCheckoutPage() {
  return (
    <Suspense>
      <MockCheckoutContent />
    </Suspense>
  )
}
