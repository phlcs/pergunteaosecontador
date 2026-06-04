'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type AuthState = 'idle' | 'in' | 'out'

export default function NavAuthLink() {
  const [auth, setAuth] = useState<AuthState>('idle')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => setAuth(r.ok ? 'in' : 'out'))
      .catch(() => setAuth('out'))
  }, [])

  if (auth === 'idle') return null
  if (auth === 'in') {
    return (
      <Link href="/app" className="nav-auth-link">
        Minha área
      </Link>
    )
  }
  return (
    <Link href="/login" className="nav-auth-link">
      Entrar
    </Link>
  )
}
