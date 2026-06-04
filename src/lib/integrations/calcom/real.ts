import type { CalcomAdapter } from './types'

export const calcomReal: CalcomAdapter = {
  async listAvailableSlots() {
    throw new Error('[calcom real] not implemented yet — set CALCOM_MODE=mock')
  },
  async createBooking() {
    throw new Error('[calcom real] not implemented yet — set CALCOM_MODE=mock')
  },
  async cancelBooking() {
    throw new Error('[calcom real] not implemented yet — set CALCOM_MODE=mock')
  },
}
