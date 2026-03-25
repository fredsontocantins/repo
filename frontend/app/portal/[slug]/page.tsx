'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Users, Target, Heart, Clock, Calendar, MapPin, ArrowRight, Award, Leaf, CheckCircle2, Star } from 'lucide-react'
import PortalNav from '@/components/portal/PortalNav'

interface PortalProps { params: { slug: string } }

export default function PortalHome({ params }: PortalProps) {
  const { slug } = params
  const [org, setOrg] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError('')
    Promise.allSettled([
      api.publicGetOrg(slug),
      api.publicGetStats(slug),
      api.publicGetCampaigns(slug, { limit: 6 }),
      api.publicGetEvents(slug, { limit: 6 }),
      api.publicGetLeaderboard(slug, { limit: 8 }),
    ])
      .then(([orgResult, statsResult, campaignsResult, eventsResult, leaderboardResult]) => {
        if (isCancelled) return
        if (orgResult.status === 'fulfilled') {
          setOrg(orgResult.value)
        } else {
          setError('Portal não encontrado ou indisponível.')
          return
        }

        if (statsResult.status === 'fulfilled') setStats(statsResult.value)
        if (campaignsResult.status === 'fulfilled') setCampaigns(campaignsResult.value.data || [])
        else setCampaigns([])
        if (eventsResult.status === 'fulfilled') setEvents(eventsResult.value.data || [])
        else setEvents([])
        if (leaderboardResult.status === 'fulfilled') setLeaderboard(leaderboardResult.value)
        else setLeaderboard([])
      })
      .catch(() => {
        if (!isCancelled) setError('Portal não encontrado ou indisponível.')
      })
      .finally(() => {
        if (!isCancelled) setLoading(false)
      })

    return () => { isCancelled = true }
  }, [slug])

  const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)
  const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)
  const pct = (v: number, m: number) => m > 0 ? Math.min(100, Math.round((v / m) * 100)) : 0

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center animate-bounce">
          <Leaf size={28} className="text-emerald-500" />
        </div>
        <p className="text-emerald-700 font-semibold text-sm">Carregando portal...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
      <div className="text-center bg-white rounded-3xl p-12 shadow-xl">
        <p className="text-slate-600 text-lg">{error}</p>
        <Link href="/" className="text-emerald-600 text-sm mt-4 inline-block font-semibold">← Voltar</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* ── NAV ── */}
      <PortalNav slug={slug} orgName={org?.name} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 text-white">
        {/* Fun background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-16 w-60 h-60 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full" />
          {/* Dots pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold mb-8">
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            Portal Público · {org?.city || 'Brasil'} 🌱
          </div>

          <h1 className="text-5xl md:text-6xl font-black font-display leading-tight mb-5 drop-shadow-sm">
            Transforme vidas com<br />
            <span className="bg-white/25 px-4 rounded-2xl">seu voluntariado! 🤝</span>
          </h1>

          <p className="text-white/85 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {org?.portalDescricao || org?.description || 'Junte-se a nós e ajude a transformar comunidades com seu tempo e talento.'}
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href={`/portal/${slug}/campaigns`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-black rounded-2xl shadow-xl hover:-translate-y-1 transition-all text-sm">
              Ver Campanhas <ArrowRight size={16} />
            </Link>
            <Link href={`/portal/${slug}/leaderboard`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white/40 hover:bg-white/30 hover:-translate-y-1 transition-all text-sm">
              🏆 Ver Ranking
            </Link>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-white" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      {stats && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Voluntários', value: fmt(stats.voluntariosAtivos), emoji: '🙋', bg: 'from-blue-400 to-indigo-500', light: 'bg-blue-50 border-blue-100' },
              { label: 'Campanhas', value: fmt(stats.campanhasAtivas), emoji: '📢', bg: 'from-emerald-400 to-teal-500', light: 'bg-emerald-50 border-emerald-100' },
              { label: 'Arrecadado', value: fmtBRL(stats.totalArrecadado), emoji: '💰', bg: 'from-amber-400 to-orange-500', light: 'bg-amber-50 border-amber-100' },
              { label: 'Horas Doadas', value: fmt(stats.totalHoras) + 'h', emoji: '⏰', bg: 'from-pink-400 to-rose-500', light: 'bg-pink-50 border-pink-100' },
              { label: 'Eventos', value: fmt(stats.eventosAgendados), emoji: '📅', bg: 'from-purple-400 to-violet-500', light: 'bg-purple-50 border-purple-100' },
            ].map(s => (
              <div key={s.label} className={`${s.light} border rounded-3xl p-5 text-center hover:-translate-y-1 transition-all duration-300`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg`}>
                  {s.emoji}
                </div>
                <p className="text-2xl font-black text-slate-900 font-display">{s.value}</p>
                <p className="text-slate-500 text-xs font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CAMPANHAS ── */}
      {campaigns.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                💚 Em andamento
              </span>
              <h2 className="text-3xl font-black font-display text-slate-900">Campanhas Ativas</h2>
            </div>
            <Link href={`/portal/${slug}/campaigns`}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 6).map((c: any, idx: number) => {
              const gradients = [
                'from-emerald-400 to-teal-500',
                'from-blue-400 to-indigo-500',
                'from-orange-400 to-amber-500',
                'from-pink-400 to-rose-500',
                'from-purple-400 to-violet-500',
                'from-cyan-400 to-blue-500',
              ]
              const prog = pct(c.arrecadado, c.metaArrecadacao || 0)
              return (
                <div key={c.id} className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                  {/* Card top color bar */}
                  <div className={`h-2 bg-gradient-to-r ${gradients[idx % 6]}`} />
                  <div className="p-6">
                    {c.destaque && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3">
                        ⭐ Destaque
                      </div>
                    )}
                    <h3 className="font-black text-slate-900 text-base mb-2 group-hover:text-emerald-600 transition-colors">{c.nome}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">{c.descricao}</p>

                    {c.metaArrecadacao && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-500 font-medium">{fmtBRL(c.arrecadado)}</span>
                          <span className="font-black text-emerald-600">{prog}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${gradients[idx % 6]} rounded-full transition-all duration-700`}
                            style={{ width: `${prog}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 text-right">meta {fmtBRL(c.metaArrecadacao)}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">👥 {c.voluntariosAtivos} vol.</span>
                      <span className="flex items-center gap-1">💝 {c._count?.donations || 0} doações</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── EVENTOS ── */}
      {events.length > 0 && (
        <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                📅 Agenda
              </span>
              <h2 className="text-3xl font-black font-display text-slate-900">Próximos Eventos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.slice(0, 4).map((ev: any) => (
                <div key={ev.id} className="bg-white rounded-2xl border-2 border-slate-100 p-5 flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                  <div className="text-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-3 w-16 flex-shrink-0 shadow-md">
                    <p className="text-2xl font-black text-white leading-none">{new Date(ev.dataInicio).getDate()}</p>
                    <p className="text-[10px] text-blue-100 uppercase mt-0.5 font-bold">
                      {new Date(ev.dataInicio).toLocaleDateString('pt-BR', { month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900">{ev.nome}</h3>
                    {ev.descricao && <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{ev.descricao}</p>}
                    {ev.local && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                        <MapPin size={11} className="text-emerald-500" />{ev.local}
                      </div>
                    )}
                    {ev.capacidade && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <Users size={11} className="text-blue-500" />
                        {ev._count?.registrations || 0}/{ev.capacidade} inscritos
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LEADERBOARD PREVIEW ── */}
      {leaderboard.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                🏆 Reconhecimento
              </span>
              <h2 className="text-3xl font-black font-display text-slate-900">Top Voluntários</h2>
            </div>
            <Link href={`/portal/${slug}/leaderboard`}
              className="text-amber-600 hover:text-amber-700 text-sm font-bold flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-xl hover:bg-amber-100 transition-all">
              Ver ranking completo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {leaderboard.slice(0, 3).map((v: any, i: number) => {
              const medals = ['🥇', '🥈', '🥉']
              const bgs = ['bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200', 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200', 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200']
              return (
                <div key={v.id} className={`rounded-3xl border-2 p-6 text-center hover:-translate-y-1 transition-all duration-300 ${bgs[i]}`}>
                  <div className="text-4xl mb-3">{medals[i]}</div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg">
                    {v.nome[0].toUpperCase()}
                  </div>
                  <p className="font-black text-slate-900">{v.nome}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{v.profissao || '—'}</p>
                  <div className="flex items-center justify-center gap-1 mt-3 bg-white rounded-xl px-3 py-2 shadow-sm">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-black text-slate-800 text-sm">{fmt(v.pontos)}</span>
                    <span className="text-slate-400 text-xs">pts</span>
                  </div>
                  {v.badges?.length > 0 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {v.badges.map((b: any, bi: number) => (
                        <span key={bi} className="text-xl">{b.badge?.icone}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── CTA CERTIFICADO ── */}
      <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-3xl font-black font-display mb-3">Verificar Certificado</h2>
          <p className="text-white/80 mb-8">Confirme a autenticidade de certificados emitidos por esta organização.</p>
          <Link href="/portal/certificate"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-black rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
            <CheckCircle2 size={18} /> Verificar agora
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <Leaf size={15} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white">{org?.name}</p>
              {org?.city && <p className="text-slate-500 text-xs">{org.city}, {org.state}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {org?.email && <span>📧 {org.email}</span>}
            <Link href="/portal/certificate" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors font-semibold">
              ✅ Verificar Certificado
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
