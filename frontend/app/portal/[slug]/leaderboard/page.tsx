'use client'
import { useEffect, useState } from 'react'
import PortalNav from '@/components/portal/PortalNav'
import { api } from '@/lib/api'
import { Trophy, Star, Clock } from 'lucide-react'

interface PortalLeaderboardProps { params: { slug: string } }

const fmtNumber = (value?: number) => value?.toLocaleString('pt-BR') || '0'

export default function PortalLeaderboardPage({ params }: PortalLeaderboardProps) {
  const { slug } = params
  const [org, setOrg] = useState<any>(null)
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      try {
        const [orgRes, board] = await Promise.all([
          api.publicGetOrg(slug),
          api.publicGetLeaderboard(slug, { limit: 12 }),
        ])
        if (!isMounted) return
        setOrg(orgRes)
        setVolunteers(board)
      } catch (error) {
        console.error(error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [slug])

  const top = volunteers.slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PortalNav slug={slug} orgName={org?.name} />

      <header className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 text-xs uppercase tracking-[0.4em]">
            <Trophy size={16} /> Ranking Público
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display">Ranking de voluntários</h1>
          <p className="max-w-3xl mx-auto text-white/80">Conheça as pessoas que mais doam tempo e pontos para causar impacto na sua comunidade.</p>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="grid md:grid-cols-3 gap-4">
          {top.map((volunteer, idx) => (
            <article key={volunteer.id} className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
              <div className="absolute -top-6 right-6 text-sm font-black text-brand-500">#{idx + 1}</div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg">
                    {volunteer.nome[0]}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{volunteer.nome}</p>
                    <p className="text-sm text-slate-500">{volunteer.profissao || 'Voluntário(a)'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Star size={14} className="text-amber-400" /> {fmtNumber(volunteer.pontos)} pts</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {fmtNumber(volunteer.horasContribuidas)}h</span>
                </div>
              </div>
              <div className="h-0.5 bg-brand-100" />
            </article>
          ))}
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-16 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 py-4">
              {volunteers.map((volunteer, idx) => (
                <div key={volunteer.id} className="flex items-center justify-between px-6 py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold text-slate-900">{volunteer.nome}</p>
                    <p className="text-xs text-slate-500">{volunteer.profissao || 'Voluntário(a)'}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="text-slate-900 font-semibold">{fmtNumber(volunteer.pontos)} pts</p>
                    <p>{fmtNumber(volunteer.horasContribuidas)}h</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
