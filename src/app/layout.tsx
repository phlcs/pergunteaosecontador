import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pergunte ao seu Contador',
  description: 'Assistente de IR com IA — tire dúvidas e agende sessão com contador',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
