'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '14px 32px',
        borderRadius: 'var(--r-pill)',
        border: '1.5px solid rgba(27,95,163,.2)',
        background: 'transparent',
        color: 'var(--blue)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-sm)',
        fontWeight: 'var(--fw-semibold)',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'all .2s ease',
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'var(--blue-light)'
          e.currentTarget.style.borderColor = 'var(--blue)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'rgba(27,95,163,.2)'
      }}
    >
      {loading ? 'Saindo...' : 'Sair da conta'}
    </button>
  )
}
