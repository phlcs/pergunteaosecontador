import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcom } from '@/lib/integrations/calcom'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const booking = await prisma.booking.findFirst({
    where: { id, userId: payload.sub },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    id: booking.id,
    scheduledAt: booking.scheduledAt,
    status: booking.status,
    meetUrl: booking.meetUrl,
    externalId: booking.externalId,
    payment: booking.payments[0] ?? null,
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const booking = await prisma.booking.findFirst({
    where: { id, userId: payload.sub },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const cancellable = ['PENDING', 'CONFIRMED'].includes(booking.status)
  const isFuture = booking.scheduledAt > new Date()
  if (!cancellable || !isFuture) {
    return NextResponse.json({ error: 'Booking cannot be cancelled' }, { status: 422 })
  }

  if (booking.externalId) {
    await calcom.cancelBooking(booking.externalId).catch(() => {})
  }

  await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } })

  return NextResponse.json({ ok: true })
}
