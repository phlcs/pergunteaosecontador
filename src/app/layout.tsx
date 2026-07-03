import type { Metadata } from 'next'
import { Fraunces, DM_Sans, Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
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

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Pergunte ao seu Contador',
    template: '%s | Pergunte ao seu Contador',
  },
  description:
    'A IA do Rafael clareia sua dúvida de imposto de graça. Se tiver dinheiro, risco ou Receita no meio, o Rafael de verdade olha com você. Sem mensalidade.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`h-full ${fraunces.variable} ${dmSans.variable} ${hankenGrotesk.variable}`}
    >
      <body className="h-full">{children}</body>
    </html>
  )
}
