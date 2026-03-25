import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voluntários SaaS - Plataforma de Gestão',
  description: 'Plataforma completa para gestão de voluntários, campanhas e doações',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
