import { resendMock } from './mock'
import { resendReal } from './real'
import type { ResendAdapter } from './types'

export type { ResendAdapter, BookingConfirmationInput, EmailResult } from './types'

const mode = process.env.RESEND_MODE ?? 'mock'
export const resend: ResendAdapter = mode === 'real' ? resendReal : resendMock
