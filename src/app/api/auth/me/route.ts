import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 })
  }

  return NextResponse.json({ user })
}
