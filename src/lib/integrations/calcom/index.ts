import { calcomMock } from './mock'
import { calcomReal } from './real'
import type { CalcomAdapter } from './types'

export type { CalcomAdapter, Slot, BookingInput, BookingOutput } from './types'

const mode = process.env.CALCOM_MODE ?? 'mock'
export const calcom: CalcomAdapter = mode === 'real' ? calcomReal : calcomMock
