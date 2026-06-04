import type { KiwifyAdapter } from './types'

export const kiwifyReal: KiwifyAdapter = {
  async createCheckout() {
    throw new Error('[kiwify real] not implemented yet — set KIWIFY_MODE=mock')
  },
  verifyWebhookSignature() {
    throw new Error('[kiwify real] not implemented yet — set KIWIFY_MODE=mock')
  },
}
