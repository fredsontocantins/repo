'use client'
import Link from 'next/link'
import { Leaf, ArrowRight } from 'lucide-react'

interface PortalNavProps {
  slug: string
  orgName?: string
}

export default function PortalNav({ slug, orgName }: PortalNavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-800 font-display">{orgName || 'Portal Público'}</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <Link href={`/portal/${slug}/leaderboard`} className="text-slate-500 hover:text-emerald-600 text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all font-medium">
            Ranking 🏆
          </Link>
          <Link href={`/portal/${slug}/campaigns`} className="text-slate-500 hover:text-emerald-600 text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all font-medium">
            Campanhas 💚
          </Link>
          <Link href="/portal/certificate" className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all">
            ✅ Verificar Certificado
          </Link>
        </div>
      </div>
    </nav>
  )
}
