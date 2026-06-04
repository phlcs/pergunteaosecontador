export type CheckoutInput = {
  paymentId: string
  amountCents: number
  userEmail: string
}

export type CheckoutOutput = {
  checkoutUrl: string
}

export interface KiwifyAdapter {
  createCheckout(input: CheckoutInput): Promise<CheckoutOutput>
  verifyWebhookSignature(payload: string, signature: string): boolean
}
