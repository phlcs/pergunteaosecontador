import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'

export default async function AppPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) redirect('/login')

  const payload = verifyToken(token)
  if (!payload) redirect('/login')

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gray-light)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-card)',
          padding: '48px 56px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            background: 'var(--blue)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: 28,
            color: '#fff',
            marginBottom: 24,
          }}
        >
          ?
        </div>

        <p
          style={{
            fontSize: 'var(--fs-label)',
            fontWeight: 'var(--fw-semibold)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: 12,
          }}
        >
          Pergunte ao seu Contador
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--dark)',
            lineHeight: 'var(--lh-snug)',
            marginBottom: 8,
          }}
        >
          Olá, {payload.name}!
        </h1>

        <p
          style={{
            fontSize: 'var(--fs-sm)',
            color: 'var(--gray)',
            lineHeight: 'var(--lh-body)',
            marginBottom: 40,
          }}
        >
          O assistente de IA está quase pronto. Em breve você poderá tirar suas dúvidas de IR
          aqui.
        </p>

        <LogoutButton />
      </div>
    </main>
  )
}
