import type { ResendAdapter, BookingConfirmationInput, EmailResult } from './types'

function fmtBR(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  })
}

export const resendMock: ResendAdapter = {
  async sendBookingConfirmation(input: BookingConfirmationInput): Promise<EmailResult> {
    const id = `mock-email-${crypto.randomUUID().slice(0, 8)}`
    console.log(`[resend mock] → to: ${input.to}`)
    console.log(`[resend mock] subject: Sessão confirmada com Rafael`)
    console.log(`[resend mock] body:`)
    console.log(`  Olá ${input.userName},`)
    console.log(`  Sua sessão está confirmada para ${fmtBR(input.scheduledAt)}.`)
    console.log(`  Link da reunião: ${input.meetUrl}`)
    return { id, success: true }
  },
}
