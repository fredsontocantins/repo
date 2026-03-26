'use client'
import Link from 'next/link'
import { Leaf, ArrowRight } from 'lucide-react'

interface PortalNavProps {
  slug: string
  orgName?: string
}

export default function PortalNav({ slug, orgName }: PortalNavProps) {
  return (
    <nav className="sticky top-0 z-50 portal-nav">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 logo-mark rounded-2xl flex items-center justify-center shadow-md shadow-[rgba(236,72,153,0.35)]">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-black text-white font-display tracking-[0.2em] uppercase text-xs">{orgName || 'Portal Público'}</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <Link href={`/portal/${slug}/leaderboard`} className="px-4 py-2 text-sm font-medium rounded-xl border border-white/20 hover:border-white/40 transition-all text-white/80 hover:text-white">
            Ranking 🏆
          </Link>
          <Link href={`/portal/${slug}/campaigns`} className="px-4 py-2 text-sm font-medium rounded-xl border border-white/20 hover:border-white/40 transition-all text-white/80 hover:text-white">
            Campanhas 💚
          </Link>
          <Link href="/portal/certificate" className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-var(--pink) to-var(--blue) text-white font-bold shadow-lg shadow-[rgba(29,78,216,0.4)] hover:-translate-y-0.5 transition-all">
            ✅ Verificar Certificado
          </Link>
        </div>
      </div>
    </nav>
  )
}
