import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { calcom } from '@/lib/integrations/calcom'

export async function GET(req: NextRequest) {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dateStr = req.nextUrl.searchParams.get('date')
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: 'date param required (YYYY-MM-DD)' }, { status: 400 })
  }

  const date = new Date(`${dateStr}T12:00:00`)
  const slots = await calcom.listAvailableSlots(date)
  return NextResponse.json({ slots })
}
