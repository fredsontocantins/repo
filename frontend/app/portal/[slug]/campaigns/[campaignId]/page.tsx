'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Users, Heart, Clock } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { api } from '@/lib/api'

type Params = { params: { slug: string; campaignId: string } }

export default function CampaignDetail({ params }: Params) {
  const { slug, campaignId } = params
  const [org, setOrg] = useState<any>(null)
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [intentForm, setIntentForm] = useState({ nome: '', email: '', telefone: '', profissao: '', mensagem: '' })
  const [intentStatus, setIntentStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [intentMessage, setIntentMessage] = useState('')
  const [showIntentModal, setShowIntentModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.allSettled([
      api.publicGetOrg(slug),
      api.publicGetCampaignDetail(slug, Number(campaignId)),
    ])
      .then(([orgResult, campaignResult]) => {
        if (cancelled) return
        if (orgResult.status === 'fulfilled') setOrg(orgResult.value)
        if (campaignResult.status === 'fulfilled') setCampaign(campaignResult.value)
        else setError('Campanha não encontrada ou indisponível no momento.')
      })
      .catch(() => {
        if (!cancelled) setError('Não conseguimos abrir a campanha agora.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [slug, campaignId])

  const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)
  const fmtDate = (value?: string | Date) => value ? new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
  const progress = campaign?.metaArrecadacao ? Math.min(100, Math.round(((campaign.arrecadado || 0) / campaign.metaArrecadacao) * 100)) : 0
  const subject = `Quero me voluntariar na campanha "${campaign?.nome || ''}"`
  const body = `Olá!\n\nMe interessei pela campanha "${campaign?.nome || ''}" do portal ${org?.name || ''}.\nVocês podem me enviar mais detalhes de como participar?\n\nObrigado!`
  const mailto = `mailto:${org?.email || 'contato@voluntariosunidos.org.br'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center animate-spin">
            <Sparkles size={28} className="text-brand-500" />
          </div>
          <p className="text-brand-700 font-semibold text-sm">Carregando campanha...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <p className="text-slate-600 text-lg">{error || 'Campanha não encontrada.'}</p>
          <Link href={`/portal/${slug}/campaigns`} className="mt-4 inline-flex items-center gap-2 text-brand-600 font-semibold">
            <ArrowLeft size={14} /> Voltar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-brand-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-4">
          <Link href={`/portal/${slug}/campaigns`} className="text-slate-500 hover:text-brand-600 flex items-center gap-2 text-sm font-semibold transition-colors bg-brand-50 px-3 py-2 rounded-xl">
            <ArrowLeft size={14} /> Campanhas
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-500 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-800">{org?.name}</span>
          </div>
        </div>
      </nav>

      <header className="max-w-5xl mx-auto px-6 py-16 space-y-6 text-slate-900">
        <div className="flex items-center gap-3 text-xs text-brand-700">
          <span className="bg-brand-100 px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold">{campaign.status === 'ACTIVE' ? 'Campanha aberta' : campaign.status}</span>
          <span className="text-slate-400">{campaign.destaque ? 'Destaque do portal' : 'Iniciativa comunitária'}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-display leading-tight">{campaign.nome}</h1>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">{campaign.descricao || 'Sem descrição disponível, mas você já pode se voluntariar!'}</p>
        {campaign.objetivo && (
          <p className="text-sm text-slate-500 max-w-3xl">Objetivo: <span className="font-semibold text-slate-800">{campaign.objetivo}</span></p>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-10 pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div>
              <p className="text-xs uppercase text-slate-500 tracking-wider">Meta financeira</p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-black text-slate-900">{fmtBRL(campaign.arrecadado || 0)}</p>
                  <p className="text-xs text-slate-500">de {fmtBRL(campaign.metaArrecadacao || 0)}</p>
                </div>
                <span className="text-sm font-semibold text-brand-600">{progress}% alcançado</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Users size={14} className="text-blue-500" /> <span className="font-bold text-slate-900">{campaign.voluntariosAtivos || 0}</span> voluntários ativos</p>
              <p className="flex items-center gap-2"><Heart size={14} className="text-pink-500" /> <span className="font-bold text-slate-900">{campaign._count?.donations || 0}</span> doações registradas</p>
              <p className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> Início: <span className="font-semibold text-slate-900">{fmtDate(campaign.dataInicio)}</span></p>
              <p className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> Fim: <span className="font-semibold text-slate-900">{fmtDate(campaign.dataFim)}</span></p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800 mb-2">Como participar?</p>
              <p>Envie uma mensagem para <span className="font-semibold">{org?.email || 'contato@voluntariosunidos.org.br'}</span> com seu nome e disponibilidade. Você receberá instruções para se juntar à equipe desta campanha.</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
    <div>
      <p className="text-xs uppercase text-slate-500 tracking-wider">Contato direto</p>
      <p className="text-sm text-slate-600">{org?.portalDescricao || org?.description}</p>
    </div>
    <button type="button" onClick={() => setShowIntentModal(true)} className="inline-flex items-center gap-2 justify-center w-full rounded-2xl bg-brand-600 text-white py-3 font-semibold shadow-lg shadow-brand-300 hover:bg-brand-700 transition">
      Quero me voluntariar
    </button>
    <a href={mailto} className="w-full inline-flex items-center gap-2 justify-center rounded-2xl border border-brand-200 text-brand-600 py-3 font-semibold shadow-sm hover:bg-brand-50 transition">
      Enviar e-mail direto
    </a>
    <div className="text-xs text-slate-500 space-y-1">
      {org?.website && <p>Site oficial: <Link href={org.website} className="text-brand-600">{new URL(org.website).hostname}</Link></p>}
      <p>Email: <span className="font-semibold text-slate-900">{org?.email}</span></p>
    </div>
  </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Eventos conectados</h3>
              <span className="text-xs text-slate-400">Próximos momentos</span>
            </div>
            {!campaign.upcomingEvents?.length ? (
              <p className="text-xs text-slate-500">Nenhum evento público vinculado no momento.</p>
            ) : (
              <div className="space-y-3">
                {campaign.upcomingEvents.map((event: any) => (
                  <div key={event.id} className="p-4 rounded-2xl bg-slate-50">
                    <p className="text-sm font-semibold text-slate-900">{event.nome}</p>
                    <p className="text-xs text-slate-500">{event.local || 'Local a confirmar'}</p>
                    <p className="text-xs text-slate-400">{fmtDate(event.dataInicio)}{event.dataFim ? ' – ' + fmtDate(event.dataFim) : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Voluntários de destaque</h3>
              <span className="text-xs text-slate-400">Últimos registrados</span>
            </div>
            {!campaign.featuredVolunteers?.length ? (
              <p className="text-xs text-slate-500">Seja o primeiro a se juntar!</p>
            ) : (
              <div className="space-y-3">
                {campaign.featuredVolunteers.map((vol: any) => (
                  <div key={vol.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-semibold">{vol.nome?.[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{vol.nome}</p>
                      <p className="text-xs text-slate-500">{vol.profissao || 'Voluntário'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

    </main>
    <Modal open={showIntentModal} onClose={() => { setShowIntentModal(false); setIntentStatus('idle'); setIntentMessage('') }} title="Manifestar interesse" size="md">
      <form onSubmit={async e => {
        e.preventDefault()
        setIntentStatus('sending')
        setIntentMessage('')
        try {
          await api.publicExpressInterest(slug, Number(campaignId), intentForm)
          setIntentStatus('success')
          setIntentMessage('Registramos sua intenção. Equipe interna avaliará e entrará em contato.')
          setIntentForm({ nome: '', email: '', telefone: '', profissao: '', mensagem: '' })
        } catch (err: any) {
          setIntentStatus('error')
          setIntentMessage(err?.message || 'Falha ao enviar intenção.')
        }
      }} className="space-y-4">
        <div className="space-y-2">
          <label className="label">Nome completo *</label>
          <input className="input" required value={intentForm.nome} onChange={e => setIntentForm(f => ({ ...f, nome: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="label">Email *</label>
          <input className="input" type="email" required value={intentForm.email} onChange={e => setIntentForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label">Telefone</label>
            <input className="input" value={intentForm.telefone} onChange={e => setIntentForm(f => ({ ...f, telefone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="label">Profissão</label>
            <input className="input" value={intentForm.profissao} onChange={e => setIntentForm(f => ({ ...f, profissao: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="label">Mensagem</label>
          <textarea className="input" rows={3} value={intentForm.mensagem} onChange={e => setIntentForm(f => ({ ...f, mensagem: e.target.value }))} />
        </div>
        {intentMessage && (
          <p className={intentStatus === 'success' ? 'text-brand-600 text-sm' : 'text-red-600 text-sm'}>{intentMessage}</p>
        )}
        <p className="text-xs text-slate-400">Seu pedido ficará pendente até que alguém da equipe aprove manualmente.</p>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={() => setShowIntentModal(false)}>Fechar</button>
          <button type="submit" disabled={intentStatus === 'sending'} className="btn-primary flex-1">
            {intentStatus === 'sending' ? 'Enviando...' : 'Enviar intenção'}
          </button>
        </div>
      </form>
    </Modal>
    </div>
  )
}
