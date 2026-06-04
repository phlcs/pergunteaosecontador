import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kiwify } from '@/lib/integrations/kiwify'
import { calcom } from '@/lib/integrations/calcom'
import { resend } from '@/lib/integrations/resend'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-kiwify-signature') ?? ''

  if (!kiwify.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const paymentId = event.paymentId as string | undefined
  const status = event.status as string | undefined

  if (!paymentId) return NextResponse.json({ ok: true })

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { user: true } } },
  })
  if (!payment || !payment.booking) return NextResponse.json({ ok: true })

  const { booking } = payment

  if (status === 'paid') {
    const calBooking = await calcom.createBooking({
      userId: booking.userId,
      scheduledAt: booking.scheduledAt,
      userEmail: booking.user.email,
      userName: booking.user.name,
    })

    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: 'PAID', externalId: String(event.externalId ?? '') } }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED', externalId: calBooking.id, meetUrl: calBooking.meetUrl },
      }),
    ])

    await resend.sendBookingConfirmation({
      to: booking.user.email,
      userName: booking.user.name,
      scheduledAt: booking.scheduledAt,
      meetUrl: calBooking.meetUrl,
    })
  } else if (status === 'failed' || status === 'refunded') {
    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: status === 'refunded' ? 'REFUNDED' : 'FAILED' } }),
      prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } }),
    ])
  }

  return NextResponse.json({ ok: true })
}
