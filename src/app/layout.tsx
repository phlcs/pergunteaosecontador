import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pergunte ao seu Contador — Seu IR resolvido em 1 hora',
  description:
    'Sessão individual com um contador de verdade. Diagnóstico fiscal, orientação passo a passo e checklist personalizado. R$ 197, pagamento único, Google Meet.',
  openGraph: {
    title: 'Pergunte ao seu Contador — Seu IR resolvido em 1 hora',
    description:
      'Sessão individual com um contador de verdade. Diagnóstico fiscal, orientação passo a passo e checklist personalizado. R$ 197, pagamento único.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${fraunces.variable} ${dmSans.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  )
}
