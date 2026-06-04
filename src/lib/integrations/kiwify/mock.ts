import type { KiwifyAdapter, CheckoutInput, CheckoutOutput } from './types'

export const kiwifyMock: KiwifyAdapter = {
  async createCheckout(input: CheckoutInput): Promise<CheckoutOutput> {
    const params = new URLSearchParams({
      paymentId: input.paymentId,
      amount: String(input.amountCents),
    })
    return { checkoutUrl: `/booking/mock-checkout?${params.toString()}` }
  },

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true
  },
}
