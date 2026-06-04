export type BookingConfirmationInput = {
  to: string
  userName: string
  scheduledAt: Date
  meetUrl: string
}

export type EmailResult = {
  id: string
  success: boolean
}

export interface ResendAdapter {
  sendBookingConfirmation(input: BookingConfirmationInput): Promise<EmailResult>
}
