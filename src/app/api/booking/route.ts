import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { kiwify } from '@/lib/integrations/kiwify'

const SESSION_PRICE_CENTS = parseInt(process.env.SESSION_PRICE_CENTS ?? '19700', 10)

const bodySchema = z.object({
  scheduledAt: z.string().datetime(),
  userName: z.string().min(2),
  userEmail: z.string().email(),
})

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 })
  }

  const { scheduledAt, userName, userEmail } = parsed.data

  // Create Booking + Payment atomically
  const booking = await prisma.booking.create({
    data: {
      userId: payload.sub,
      scheduledAt: new Date(scheduledAt),
      status: 'PENDING',
      payments: {
        create: {
          userId: payload.sub,
          amountCents: SESSION_PRICE_CENTS,
          status: 'PENDING',
        },
      },
    },
    include: { payments: true },
  })

  const payment = booking.payments[0]

  const checkout = await kiwify.createCheckout({
    paymentId: payment.id,
    amountCents: SESSION_PRICE_CENTS,
    userEmail,
  })

  return NextResponse.json({
    bookingId: booking.id,
    paymentId: payment.id,
    checkoutUrl: checkout.checkoutUrl,
  })
}
