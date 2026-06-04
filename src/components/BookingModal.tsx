'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Slot = { time: string; available: boolean }

type User = { name: string; email: string }

type Props = {
  user: User
  onClose: () => void
  context?: string | null
}

const SESSION_PRICE = 'R$ 197'
const DAYS_AHEAD = 14

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function isWeekend(d: Date) {
  const day = d.getDay()
  return day === 0 || day === 6
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fmtDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="bk-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
    </svg>
  )
}

export default function BookingModal({ user, onClose, context }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1 state
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>('')

  // Step 2 state
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  // Step 3 state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Build list of upcoming weekdays (next 14 days)
  const today = new Date()
  const availableDates: string[] = []
  for (let i = 1; availableDates.length < DAYS_AHEAD; i++) {
    const d = addDays(today, i)
    if (!isWeekend(d)) availableDates.push(toLocalDateStr(d))
  }

  const fetchSlots = useCallback(async (dateStr: string) => {
    setLoadingSlots(true)
    setSelectedTime('')
    setSlots([])
    try {
      const res = await fetch(`/api/booking/slots?date=${dateStr}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const d = e.target.value
    setSelectedDate(d)
    if (d) fetchSlots(d)
  }

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    setSubmitError(null)

    // Build ISO datetime: date + time in local timezone
    const [h, min] = selectedTime.split(':')
    const [y, mo, d] = selectedDate.split('-').map(Number)
    const dt = new Date(y, mo - 1, d, parseInt(h), parseInt(min))

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: dt.toISOString(), userName: name, userEmail: email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error ?? 'Erro ao criar agendamento')
      }
      const data = await res.json()
      router.push(data.checkoutUrl)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
      setSubmitting(false)
    }
  }

  // Trap Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const availableSlots = slots.filter((s) => s.available)

  return (
    <div className="bk-overlay" onClick={onClose}>
      <div className="bk-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="bk-close" onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </button>

        {/* Step indicator */}
        <div className="bk-steps">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`bk-step-dot${step === n ? ' active' : step > n ? ' done' : ''}`}>
              {step > n ? <CheckIcon /> : n}
            </div>
          ))}
          <div className="bk-step-label">Passo {step} de 3</div>
        </div>

        {/* ── Step 1: escolha de data + slot ── */}
        {step === 1 && (
          <div className="bk-body">
            <h2 className="bk-title">Escolha seu horário</h2>
            <p className="bk-sub">
              Sessão de 1h com o <strong>Rafael</strong>, contador de verdade, por Google Meet.
              {context ? ' Ele já chega sabendo do seu caso.' : ''}
            </p>

            <div className="bk-field">
              <label className="bk-label">Data</label>
              <select className="bk-select" value={selectedDate} onChange={handleDateChange}>
                <option value="">Selecione uma data...</option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>{fmtDisplayDate(d)}</option>
                ))}
              </select>
            </div>

            {selectedDate && (
              <div className="bk-field">
                <label className="bk-label">Horário disponível</label>
                {loadingSlots ? (
                  <div className="bk-slots-loading"><SpinnerIcon /> Carregando horários...</div>
                ) : availableSlots.length === 0 ? (
                  <p className="bk-no-slots">Nenhum horário disponível neste dia. Escolha outra data.</p>
                ) : (
                  <div className="bk-slot-grid">
                    {availableSlots.map((s) => (
                      <button
                        key={s.time}
                        className={`bk-slot${selectedTime === s.time ? ' sel' : ''}`}
                        onClick={() => setSelectedTime(s.time)}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              className="bk-btn"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(2)}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── Step 2: confirmar dados ── */}
        {step === 2 && (
          <div className="bk-body">
            <h2 className="bk-title">Confirme seus dados</h2>
            <div className="bk-summary">
              <span className="bk-summary-icon">📅</span>
              <span>
                <strong>Sessão 1h com Rafael</strong><br />
                {fmtDisplayDate(selectedDate)} às {selectedTime} · {SESSION_PRICE}
              </span>
            </div>

            <div className="bk-field">
              <label className="bk-label">Nome completo</label>
              <input
                className="bk-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como o Rafael vai te chamar"
              />
            </div>
            <div className="bk-field">
              <label className="bk-label">E-mail</label>
              <input
                className="bk-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Para receber confirmação e link"
              />
            </div>

            <div className="bk-btn-row">
              <button className="bk-btn-ghost" onClick={() => setStep(1)}>← Voltar</button>
              <button
                className="bk-btn"
                disabled={!name.trim() || !email.trim()}
                onClick={() => setStep(3)}
              >
                Ir para pagamento →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: checkout ── */}
        {step === 3 && (
          <div className="bk-body">
            <h2 className="bk-title">Resumo do pedido</h2>
            <div className="bk-confirm-detail">
              <div className="bk-detail-row">
                <span>Quando</span>
                <span>{fmtDisplayDate(selectedDate)} · {selectedTime}</span>
              </div>
              <div className="bk-detail-row">
                <span>Com</span>
                <span>Rafael · CRC ativo</span>
              </div>
              <div className="bk-detail-row">
                <span>Onde</span>
                <span>Google Meet (link por e-mail)</span>
              </div>
              <div className="bk-detail-row">
                <span>Para</span>
                <span>{name} · {email}</span>
              </div>
              <div className="bk-detail-row bk-detail-price">
                <span>Valor</span>
                <strong>{SESSION_PRICE}</strong>
              </div>
            </div>

            {submitError && <div className="bk-error">{submitError}</div>}

            <div className="bk-btn-row">
              <button className="bk-btn-ghost" onClick={() => setStep(2)} disabled={submitting}>
                ← Voltar
              </button>
              <button className="bk-btn" onClick={handlePayment} disabled={submitting}>
                {submitting ? <><SpinnerIcon /> Aguarde...</> : 'Pagar R$ 197 →'}
              </button>
            </div>

            <p className="bk-fine">
              Ao continuar, você será redirecionado para o pagamento. Após confirmar, recebe o link do Meet por e-mail.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
