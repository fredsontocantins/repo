'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  Users,
  Heart,
  Clock,
  Calendar,
  MapPin,
  ArrowRight,
  Star,
  HandHeart,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Trophy,
  Flame,
  Megaphone,
  ArrowUpRight,
} from 'lucide-react'
import PortalNav from '@/components/portal/PortalNav'
import DonateModal from '@/components/portal/DonateModal'
import VolunteerModal from '@/components/portal/VolunteerModal'

interface PortalProps { params: { slug: string } }

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)
const pct = (v: number, m: number) => m > 0 ? Math.min(100, Math.round((v / m) * 100)) : 0

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) { setValue(0); return }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function daysUntil(date: string | Date | null | undefined) {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function PortalHome({ params }: PortalProps) {
  const { slug } = params
  const [org, setOrg] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [donateOpen, setDonateOpen] = useState(false)
  const [volOpen, setVolOpen] = useState(false)
  const [preselectCampaignId, setPreselectCampaignId] = useState<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.allSettled([
      api.publicGetOrg(slug),
      api.publicGetStats(slug),
      api.publicGetCampaigns(slug, { limit: 9 }),
      api.publicGetEvents(slug, { limit: 6 }),
      api.publicGetLeaderboard(slug, { limit: 6 }),
    ]).then(([o, s, c, e, l]) => {
      if (cancelled) return
      if (o.status === 'fulfilled') setOrg(o.value)
      else { setError('Portal não encontrado ou indisponível.'); return }
      if (s.status === 'fulfilled') setStats(s.value)
      if (c.status === 'fulfilled') setCampaigns(c.value?.data ?? [])
      if (e.status === 'fulfilled') setEvents(e.value?.data ?? [])
      if (l.status === 'fulfilled') setLeaderboard(l.value ?? [])
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  const simpleCampaigns = useMemo(
    () => campaigns.map((c: any) => ({ id: c.id, nome: c.nome })),
    [campaigns],
  )

  const featured = useMemo(() => {
    if (!campaigns.length) return null
    return campaigns.find((c: any) => c.destaque) ?? campaigns[0]
  }, [campaigns])

  // animated counters
  const aVolunteers = useCountUp(stats?.voluntariosAtivos ?? 0)
  const aCampaigns = useCountUp(stats?.campanhasAtivas ?? 0)
  const aHours = useCountUp(stats?.totalHoras ?? 0)
  const aEvents = useCountUp(stats?.eventosAgendados ?? 0)
  const aArrecadado = useCountUp(Math.round(stats?.totalArrecadado ?? 0))

  const openDonate = (campaignId?: number) => { setPreselectCampaignId(campaignId); setDonateOpen(true) }
  const openVolunteer = (campaignId?: number) => { setPreselectCampaignId(campaignId); setVolOpen(true) }

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `Apoie ${org?.name ?? 'esta causa'}`
    try {
      if (navigator.share) await navigator.share({ title: text, url })
      else { await navigator.clipboard.writeText(url); alert('Link copiado!') }
    } catch { /* user cancel */ }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center animate-pulse">
          <Heart size={28} className="text-brand-600" />
        </div>
        <p className="text-brand-700 font-semibold text-sm">Carregando portal...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
      <div className="text-center bg-white rounded-3xl p-12 shadow-xl">
        <p className="text-slate-600 text-lg">{error}</p>
        <Link href="/" className="text-brand-600 text-sm mt-4 inline-block font-semibold">← Voltar</Link>
      </div>
    </div>
  )

  const featuredProgress = featured ? pct(featured.arrecadado, featured.metaArrecadacao || 0) : 0
  const featuredRemain = featured ? Math.max(0, (featured.metaArrecadacao || 0) - (featured.arrecadado || 0)) : 0
  const featuredDays = featured ? daysUntil(featured.dataFim) : null

  return (
    <div className="portal-content text-slate-900 pb-28 md:pb-0">
      <PortalNav slug={slug} orgName={org?.name}>
        <button onClick={() => openDonate()}
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-amber-900 text-sm font-black shadow-sm hover:bg-amber-300 transition">
          <HandHeart size={15} /> Doar agora
        </button>
      </PortalNav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[480px] h-[480px] bg-amber-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-[520px] h-[520px] bg-cyan-300/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1.2px)',
            backgroundSize: '28px 28px'
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/25 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
              {org?.city ? `${org.city}, ${org.state ?? 'Brasil'}` : 'Portal Público'} · Organização social
            </div>

            <h1 className="text-[2.4rem] md:text-6xl font-black font-display leading-[1.05] tracking-tight mb-5">
              Sua ajuda transforma <span className="bg-amber-300 text-brand-900 px-3 rounded-xl">vidas</span> todos os dias.
            </h1>

            <p className="text-white/85 text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
              {org?.portalDescricao || org?.description || `A ${org?.name ?? 'nossa organização'} conecta voluntários e doadores para acelerar impacto social em comunidades reais. Basta um clique para começar.`}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => openDonate()}
                className="group inline-flex items-center gap-2 px-7 py-4 bg-amber-400 hover:bg-amber-300 text-brand-900 font-black rounded-2xl shadow-xl shadow-amber-500/30 hover:-translate-y-0.5 transition-all text-base">
                <HandHeart size={18} /> Doar agora
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition" />
              </button>
              <button onClick={() => openVolunteer()}
                className="inline-flex items-center gap-2 px-7 py-4 bg-white/15 backdrop-blur text-white font-black rounded-2xl border-2 border-white/40 hover:bg-white/25 hover:-translate-y-0.5 transition-all text-base">
                <Users size={18} /> Quero ser voluntário
              </button>
            </div>

            {/* trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/80">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-300" /> Doação registrada e rastreável</span>
              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-amber-300" /> Equipe entra em contato em 24h</span>
              <span className="flex items-center gap-1.5"><Heart size={14} className="text-rose-300" /> 100% do recurso vai pra causa</span>
            </div>
          </div>

          {/* HERO CARD — live featured campaign */}
          {featured ? (
            <div className="relative">
              <div className="absolute -top-4 -right-4 bg-amber-400 text-brand-900 px-3 py-1 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1 z-10">
                <Flame size={12} /> URGENTE
              </div>
              <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 border border-white/20 p-6 text-slate-800">
                <p className="text-[11px] uppercase tracking-[0.25em] text-brand-600 font-bold mb-1">Campanha em destaque</p>
                <h3 className="text-xl font-black font-display leading-snug mb-3">{featured.nome}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{featured.descricao || 'Contribua para que esta causa avance mais rápido.'}</p>

                {featured.metaArrecadacao > 0 && (
                  <>
                    <div className="flex items-end justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Arrecadado</span>
                      <span className="text-brand-700 font-black text-lg leading-none">{fmtBRL(featured.arrecadado || 0)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-brand-500 rounded-full transition-all duration-700"
                        style={{ width: `${featuredProgress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span><span className="font-bold text-brand-700">{featuredProgress}%</span> da meta {fmtBRL(featured.metaArrecadacao)}</span>
                      <span>Faltam <span className="font-bold text-rose-600">{fmtBRL(featuredRemain)}</span></span>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-600 mb-5">
                  <span className="inline-flex items-center gap-1"><Users size={13} className="text-brand-600" /> {featured.voluntariosAtivos ?? 0} voluntários</span>
                  <span className="inline-flex items-center gap-1"><Heart size={13} className="text-rose-500" /> {featured._count?.donations ?? 0} doações</span>
                  {featuredDays !== null && featuredDays >= 0 && featuredDays <= 60 && (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold"><Clock size={13} /> {featuredDays === 0 ? 'último dia' : `${featuredDays} dias restantes`}</span>
                  )}
                </div>

                <button onClick={() => openDonate(featured.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-black shadow-lg hover:-translate-y-0.5 transition">
                  <HandHeart size={16} /> Apoiar esta campanha
                </button>
                <button onClick={() => openVolunteer(featured.id)}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-brand-100 hover:border-brand-300 text-brand-700 font-bold text-sm transition">
                  Quero ser voluntário dessa causa
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white/10 border border-white/20 p-8 text-center">
              <Megaphone size={32} className="mx-auto mb-3 text-white/70" />
              <p className="text-white/80 text-sm">Em breve, novas campanhas.</p>
            </div>
          )}
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" className="w-full fill-white" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════ IMPACT / SOCIAL PROOF ══════════════════════ */}
      {stats && (
        <section className="max-w-6xl mx-auto px-6 -mt-6 md:-mt-10 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-600">Impacto coletivo</p>
                <h2 className="text-xl md:text-2xl font-black font-display text-slate-900">Juntos já fizemos muito</h2>
              </div>
              <button onClick={share}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition">
                <Share2 size={13} /> Compartilhar
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Voluntários ativos', value: fmt(aVolunteers), icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'Campanhas abertas', value: fmt(aCampaigns), icon: Megaphone, color: 'text-brand-700', bg: 'bg-brand-50' },
                { label: 'Arrecadado', value: fmtBRL(aArrecadado), icon: HandHeart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Horas doadas', value: `${fmt(aHours)}h`, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Eventos próximos', value: fmt(aEvents), icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 hover:border-brand-200 hover:shadow-md transition">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                    <s.icon size={16} className={s.color} />
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-display leading-none">{s.value}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ CAMPANHAS ══════════════════════ */}
      {campaigns.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[11px] font-black uppercase tracking-wide mb-3 border border-brand-100">
                <Megaphone size={12} /> Em andamento
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900">Onde sua ajuda entra agora</h2>
              <p className="text-slate-500 mt-2 max-w-xl">Escolha uma causa e contribua com o valor que puder — cada real aproxima a meta.</p>
            </div>
            <Link href={`/portal/${slug}/campaigns`}
              className="text-brand-700 hover:text-brand-800 text-sm font-bold flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.slice(0, 6).map((c: any) => {
              const prog = pct(c.arrecadado, c.metaArrecadacao || 0)
              const remain = Math.max(0, (c.metaArrecadacao || 0) - (c.arrecadado || 0))
              const d = daysUntil(c.dataFim)
              const urgent = d !== null && d >= 0 && d <= 15
              const tone =
                prog >= 80 ? { bar: '#16a34a', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', chipLabel: `🎯 ${prog}% da meta` } :
                urgent ? { bar: '#dc2626', chip: 'bg-rose-50 text-rose-700 border-rose-200', chipLabel: d === 0 ? '🔥 Último dia' : `🔥 Faltam ${d} dias` } :
                c.destaque ? { bar: '#f59e0b', chip: 'bg-amber-50 text-amber-700 border-amber-200', chipLabel: '⭐ Destaque' } :
                { bar: '#22518a', chip: 'bg-brand-50 text-brand-700 border-brand-200', chipLabel: 'Em andamento' }

              return (
                <div key={c.id}
                  className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="h-1.5" style={{ backgroundColor: tone.bar }} />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide ${tone.chip}`}>
                        {tone.chipLabel}
                      </span>
                      {c._count?.donations > 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Heart size={11} className="text-rose-500" /> {c._count.donations}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-base mb-1 group-hover:text-brand-700 transition line-clamp-2">{c.nome}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{c.descricao}</p>

                    {c.metaArrecadacao > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-slate-500 font-semibold">{fmtBRL(c.arrecadado || 0)}</span>
                          <span className="font-black text-slate-700">{prog}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${prog}%`, backgroundColor: tone.bar }} />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {remain > 0
                            ? <>Faltam <span className="font-bold text-slate-700">{fmtBRL(remain)}</span> para bater a meta</>
                            : <>Meta atingida! 🎉</>}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => openDonate(c.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition">
                        <HandHeart size={14} /> Doar
                      </button>
                      <button onClick={() => openVolunteer(c.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-brand-100 hover:border-brand-300 text-brand-700 font-bold text-sm transition">
                        <Users size={14} /> Ajudar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════ EVENTOS ══════════════════════ */}
      {events.length > 0 && (
        <section className="bg-gradient-to-br from-slate-50 to-brand-50/40 py-20 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-brand-700 rounded-full text-[11px] font-black uppercase tracking-wide mb-3 border border-brand-100 shadow-sm">
                  <Calendar size={12} /> Agenda aberta
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900">Próximos eventos</h2>
                <p className="text-slate-500 mt-2 max-w-xl">Participe presencialmente — é o jeito mais rápido de entender como ajudar.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.slice(0, 4).map((ev: any) => {
                const d = new Date(ev.dataInicio)
                const ongoing = ev.status === 'ONGOING'
                return (
                  <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="text-center bg-gradient-to-br from-brand-600 to-brand-500 rounded-2xl p-3 w-16 flex-shrink-0 shadow-md">
                      <p className="text-2xl font-black text-white leading-none">{d.getDate()}</p>
                      <p className="text-[10px] text-white/80 uppercase mt-0.5 font-bold">
                        {d.toLocaleDateString('pt-BR', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 truncate">{ev.nome}</h3>
                        {ongoing && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AO VIVO
                          </span>
                        )}
                      </div>
                      {ev.descricao && <p className="text-slate-500 text-sm line-clamp-1">{ev.descricao}</p>}
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
                        {ev.local && <span className="flex items-center gap-1"><MapPin size={11} className="text-brand-600" />{ev.local}</span>}
                        {ev.capacidade && (
                          <span className="flex items-center gap-1">
                            <Users size={11} className="text-sky-600" />
                            {ev._count?.registrations || 0}/{ev.capacidade} inscritos
                          </span>
                        )}
                        {d > new Date() && <span className="flex items-center gap-1 text-amber-700 font-semibold"><Clock size={11} /> {daysUntil(ev.dataInicio)} dias</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ LEADERBOARD ══════════════════════ */}
      {leaderboard.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-black uppercase tracking-wide mb-3 border border-amber-100">
                <Trophy size={12} /> Reconhecimento
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900">Quem está fazendo acontecer</h2>
              <p className="text-slate-500 mt-2 max-w-xl">Pessoas reais doando tempo, skills e coração. Pode ser você na próxima atualização.</p>
            </div>
            <Link href={`/portal/${slug}/leaderboard`}
              className="text-amber-700 hover:text-amber-800 text-sm font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition">
              Ver ranking <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaderboard.slice(0, 6).map((v: any, i: number) => {
              const medals = ['🥇', '🥈', '🥉']
              const isTop = i < 3
              return (
                <div key={v.id}
                  className={`rounded-3xl border p-5 hover:-translate-y-1 transition-all duration-300 ${
                    isTop
                      ? 'bg-gradient-to-br from-amber-50 via-white to-white border-amber-200'
                      : 'bg-white border-slate-100'
                  }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                      {v.nome[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{v.nome} {medals[i] ?? ''}</p>
                      <p className="text-slate-500 text-xs truncate">{v.profissao || 'Voluntário'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pontos</span>
                    <span className="flex items-center gap-1">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="font-black text-slate-800 text-sm">{fmt(v.pontos)}</span>
                    </span>
                  </div>
                  {v.badges?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {v.badges.map((b: any, bi: number) => (
                        <span key={bi} className="text-lg" title={b.badge?.nome}>{b.badge?.icone}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════ COMO FUNCIONA ══════════════════════ */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-[11px] font-black uppercase tracking-wide mb-3 border border-sky-100">
              Transparência
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900">Como sua doação chega ao destino</h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Processo simples, direto e auditável por cada campanha.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: '1', t: 'Você registra a intenção', d: 'Preenche um formulário rápido com seus dados e o valor que quer doar.', icon: HandHeart, c: 'text-brand-700', b: 'bg-brand-50' },
              { n: '2', t: 'Equipe confirma em 24h', d: 'A coordenação entra em contato por e-mail ou WhatsApp com as instruções.', icon: CheckCircle2, c: 'text-emerald-600', b: 'bg-emerald-50' },
              { n: '3', t: 'Recurso aplicado na causa', d: '100% do valor vai para a campanha escolhida, com acompanhamento público.', icon: Sparkles, c: 'text-amber-600', b: 'bg-amber-50' },
            ].map(step => (
              <div key={step.n} className="bg-white border-2 border-slate-100 hover:border-brand-200 rounded-3xl p-6 transition relative overflow-hidden">
                <span className="absolute top-3 right-4 text-[80px] leading-none font-black text-slate-50 select-none">{step.n}</span>
                <div className={`w-12 h-12 rounded-2xl ${step.b} flex items-center justify-center mb-4 relative`}>
                  <step.icon size={22} className={step.c} />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2 relative">{step.t}</h3>
                <p className="text-sm text-slate-600 leading-relaxed relative">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA FINAL ══════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-300/20 border border-amber-200/40 text-amber-100 text-xs font-black uppercase tracking-wider mb-5">
            <Flame size={12} /> Faça parte hoje
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-display leading-tight mb-5">
            Você não precisa ser milionário<br />
            para mudar a <span className="bg-amber-300 text-brand-900 px-3 rounded-xl">vida de alguém</span>.
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Toda doação é registrada, toda hora de voluntariado é contabilizada, todo impacto fica documentado. Comece agora com um clique.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => openDonate()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-brand-900 font-black rounded-2xl shadow-xl shadow-amber-500/30 hover:-translate-y-0.5 transition-all">
              <HandHeart size={18} /> Doar agora
            </button>
            <button onClick={() => openVolunteer()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur text-white font-black rounded-2xl border-2 border-white/40 hover:bg-white/25 hover:-translate-y-0.5 transition-all">
              <Users size={18} /> Ser voluntário
            </button>
            <button onClick={share}
              className="inline-flex items-center gap-2 px-6 py-4 text-white/80 font-bold hover:text-white transition">
              <Share2 size={16} /> Compartilhar com amigos
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════ VERIFICAR CERTIFICADO ══════════════════════ */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-600 mb-1">Autenticidade</p>
            <h3 className="text-2xl font-black font-display text-slate-900">Verificar certificado de voluntário</h3>
            <p className="text-slate-500 text-sm mt-1">Confirme validade e integridade de um certificado emitido por esta organização.</p>
          </div>
          <Link href="/portal/certificate"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition whitespace-nowrap">
            <CheckCircle2 size={16} /> Verificar agora <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-400 rounded-xl flex items-center justify-center">
              <Heart size={15} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white">{org?.name}</p>
              {org?.city && <p className="text-slate-400 text-xs">{org.city}, {org.state}</p>}
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            {org?.email && <a href={`mailto:${org.email}`} className="hover:text-white transition">📧 {org.email}</a>}
            {org?.website && <a href={org.website} target="_blank" rel="noreferrer" className="hover:text-white transition">🌐 Site</a>}
            <Link href="/portal/certificate" className="text-brand-300 hover:text-brand-200 flex items-center gap-1 transition font-semibold">
              Certificado
            </Link>
          </div>
        </div>
      </footer>

      {/* ══════════════════════ STICKY MOBILE CTA ══════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 md:hidden z-40 bg-white/95 backdrop-blur border-t border-slate-200 p-3 flex gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button onClick={() => openDonate()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-400 text-brand-900 font-black text-sm shadow">
          <HandHeart size={16} /> Doar
        </button>
        <button onClick={() => openVolunteer()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-brand-600 text-white font-black text-sm shadow">
          <Users size={16} /> Voluntário
        </button>
      </div>

      <DonateModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        slug={slug}
        orgName={org?.name}
        campaigns={simpleCampaigns}
        defaultCampaignId={preselectCampaignId}
      />
      <VolunteerModal
        open={volOpen}
        onClose={() => setVolOpen(false)}
        slug={slug}
        orgName={org?.name}
        campaigns={simpleCampaigns}
        defaultCampaignId={preselectCampaignId}
      />
    </div>
  )
}
