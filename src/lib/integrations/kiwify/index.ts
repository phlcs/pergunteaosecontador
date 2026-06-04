import { kiwifyMock } from './mock'
import { kiwifyReal } from './real'
import type { KiwifyAdapter } from './types'

export type { KiwifyAdapter, CheckoutInput, CheckoutOutput } from './types'

const mode = process.env.KIWIFY_MODE ?? 'mock'
export const kiwify: KiwifyAdapter = mode === 'real' ? kiwifyReal : kiwifyMock
