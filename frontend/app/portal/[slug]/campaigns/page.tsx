'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, DollarSign, Target, ArrowRight, Calendar, Heart } from 'lucide-react'
import PortalNav from '@/components/portal/PortalNav'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import { api } from '@/lib/api'

interface PortalCampaignsProps { params: { slug: string } }

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)

const badges = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-purple-100 text-purple-700',
]

export default function PortalCampaignsPage({ params }: PortalCampaignsProps) {
  const { slug } = params
  const [org, setOrg] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [interestForm, setInterestForm] = useState({ nome: '', email: '', telefone: '', profissao: '', mensagem: '' })
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      try {
        const [orgRes, campRes, statsRes] = await Promise.all([
          api.publicGetOrg(slug),
          api.publicGetCampaigns(slug, { limit: 12 }),
          api.publicGetStats(slug),
        ])
        if (!isMounted) return
        setOrg(orgRes)
        setCampaigns(campRes.data)
        setStats(statsRes)
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [slug])

  const handleInterest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    setFeedback('')
    try {
      await api.publicExpressInterest(slug, selected.id, interestForm)
      setFeedback('Sua intenção foi registrada e será analisada pela equipe. Obrigado!')
      setInterestForm({ nome: '', email: '', telefone: '', profissao: '', mensagem: '' })
    } catch (error: any) {
      setFeedback(error.message || 'Não foi possível registrar sua intenção.')
    } finally {
      setSubmitting(false)
    }
  }

  const heroStats = [
    { label: 'Voluntários ativos', value: stats?.voluntariosAtivos, icon: Users },
    { label: 'Campanhas ativas', value: stats?.campanhasAtivas, icon: Target },
    { label: 'Arrecadado', value: fmtBRL(stats?.totalArrecadado || 0), icon: DollarSign },
    { label: 'Eventos agendados', value: stats?.eventosAgendados, icon: Calendar },
  ]

  const openDetail = (campaign: any) => {
    setSelected(campaign)
    setFeedback('')
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <PortalNav slug={slug} orgName={org?.name} />

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.5em] text-emerald-100 mb-4">Campanhas</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">Campanhas abertas para voluntariado</h1>
          <p className="max-w-3xl mx-auto text-white/80">Escolha uma causa, conheça a campanha e manifeste sua vontade de ajudar. Todas as intenções ficam disponíveis para análise dos coordenadores.</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {heroStats.map(stat => (
              <div key={stat.label} className="rounded-2xl bg-white/20 border border-white/30 p-4 text-left flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-white/70">{stat.label}</span>
                <span className="text-2xl font-black">{stat.value ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Campanhas em destaque</p>
            <h2 className="text-3xl font-black">Encontre onde quer ajudar</h2>
          </div>
          <Link href={`/portal/${slug}/leaderboard`} className="text-slate-500 text-sm flex items-center gap-1 font-medium">
            Ver ranking <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign, idx) => (
              <article key={campaign.id} className="relative rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4" style={{ minHeight: '220px' }}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase tracking-[0.3em] px-3 py-1 rounded-full ${badges[idx % badges.length]}`}>{campaign.destaque ? 'Destaque' : 'Em andamento'}</span>
                    <span className="text-xs text-slate-500">{campaign.voluntariosAtivos}/{campaign.metaVoluntarios || '—'} voluntários</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black line-clamp-2">{campaign.nome}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">{campaign.descricao || campaign.objetivo}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Meta: {campaign.metaArrecadacao ? fmtBRL(campaign.metaArrecadacao) : '—'}</span>
                      <span>Arrecadado: {fmtBRL(campaign.arrecadado || 0)}</span>
                    </div>
                    <ProgressBar value={campaign.arrecadado} max={campaign.metaArrecadacao || 1} />
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <Users size={14} /> {campaign._count?.donations || 0} doações
                      <Calendar size={14} /> {campaign.dataInicio ? new Date(campaign.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>
                <button
                  className="w-full border-t border-slate-100 text-sm font-semibold text-emerald-600 py-3"
                  onClick={() => openDetail(campaign)}
                >
                  Ver detalhes e se cadastrar
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.nome || 'Detalhes da campanha'} size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-500">{selected.status === 'ACTIVE' ? 'Aberta' : selected.status}</p>
              <h3 className="text-2xl font-black text-slate-900">{selected.nome}</h3>
              <p className="text-slate-600">{selected.descricao || 'Sem descrição adicional.'}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
                <div>
                  <p className="text-xs uppercase text-slate-400">Meta de arrecadação</p>
                  <p className="font-semibold text-slate-900">{fmtBRL(selected.metaArrecadacao || 0)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Voluntários desejados</p>
                  <p className="font-semibold text-slate-900">{selected.metaVoluntarios || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Campanha</p>
                  <p className="font-semibold text-slate-900">{selected.campaign?.nome || 'Campanha geral'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Período</p>
                  <p className="font-semibold text-slate-900">{selected.dataInicio ? `${new Date(selected.dataInicio).toLocaleDateString('pt-BR')} · ${selected.dataFim ? new Date(selected.dataFim).toLocaleDateString('pt-BR') : '—'}` : '—'}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleInterest} className="space-y-4">
              <p className="text-sm text-slate-500">Cadastre sua intenção e os coordenadores entrarão em contato. Todas as intenções ficam pendentes até revisão interna.</p>
              <div className="grid grid-cols-2 gap-3">
                <input value={interestForm.nome} required placeholder="Nome" className="input" onChange={e => setInterestForm(f => ({ ...f, nome: e.target.value }))} />
                <input value={interestForm.email} required type="email" placeholder="Email" className="input" onChange={e => setInterestForm(f => ({ ...f, email: e.target.value }))} />
                <input value={interestForm.telefone} placeholder="Telefone" className="input" onChange={e => setInterestForm(f => ({ ...f, telefone: e.target.value }))} />
                <input value={interestForm.profissao} placeholder="Profissão" className="input" onChange={e => setInterestForm(f => ({ ...f, profissao: e.target.value }))} />
                <textarea value={interestForm.mensagem} placeholder="Mensagem" className="input col-span-2" rows={3} onChange={e => setInterestForm(f => ({ ...f, mensagem: e.target.value }))} />
              </div>
              {feedback && <p className="text-sm text-white bg-emerald-600 rounded-2xl px-4 py-2">{feedback}</p>}
              <button className="btn-primary w-full" disabled={submitting}>{submitting ? 'Enviando...' : 'Registrar intenção de voluntariado'}</button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
