import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, makeAuthCookie } from '@/lib/auth'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Dados inválidos'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  })

  const token = signToken({ sub: user.id, email: user.email, name: user.name })

  const res = NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name } },
    { status: 201 }
  )
  res.headers.set('Set-Cookie', makeAuthCookie(token))
  return res
}
