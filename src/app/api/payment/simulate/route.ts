import { NextRequest, NextResponse } from 'next/server'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { calcom } from '@/lib/integrations/calcom'
import { resend } from '@/lib/integrations/resend'

const bodySchema = z.object({
  paymentId: z.string().min(1),
  result: z.enum(['approved', 'refused']),
})

export async function POST(req: NextRequest) {
  // DEV ONLY — disabled in production or when kiwify is real
  if (process.env.NODE_ENV === 'production' || process.env.KIWIFY_MODE === 'real') {
    notFound()
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 })
  }

  const { paymentId, result } = parsed.data

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { user: true } } },
  })
  if (!payment || !payment.booking) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const { booking } = payment

  if (result === 'refused') {
    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } }),
      prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } }),
    ])
    return NextResponse.json({ ok: true, outcome: 'cancelled' })
  }

  // Approved — call calcom mock, update records, send email
  const calBooking = await calcom.createBooking({
    userId: booking.userId,
    scheduledAt: booking.scheduledAt,
    userEmail: booking.user.email,
    userName: booking.user.name,
  })

  await prisma.$transaction([
    prisma.payment.update({ where: { id: paymentId }, data: { status: 'PAID' } }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        externalId: calBooking.id,
        meetUrl: calBooking.meetUrl,
      },
    }),
  ])

  await resend.sendBookingConfirmation({
    to: booking.user.email,
    userName: booking.user.name,
    scheduledAt: booking.scheduledAt,
    meetUrl: calBooking.meetUrl,
  })

  return NextResponse.json({ ok: true, outcome: 'confirmed', bookingId: booking.id })
}
