export type Slot = {
  time: string   // "09:00"
  available: boolean
}

export type BookingInput = {
  userId: string
  scheduledAt: Date
  userEmail: string
  userName: string
}

export type BookingOutput = {
  id: string
  meetUrl: string
}

export interface CalcomAdapter {
  listAvailableSlots(date: Date): Promise<Slot[]>
  createBooking(input: BookingInput): Promise<BookingOutput>
  cancelBooking(id: string): Promise<void>
}
