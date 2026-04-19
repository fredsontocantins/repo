'use client'
import { useState } from 'react'
import { CheckCircle2, Loader2, Users } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { api } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  slug: string
  orgName?: string
  campaigns?: Array<{ id: number; nome: string }>
  defaultCampaignId?: number
}

export default function VolunteerModal({ open, onClose, slug, orgName, campaigns = [], defaultCampaignId }: Props) {
  const [campaignId, setCampaignId] = useState<number | ''>(defaultCampaignId ?? '')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [profissao, setProfissao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setCampaignId(defaultCampaignId ?? ''); setNome(''); setEmail(''); setTelefone('')
    setProfissao(''); setMensagem(''); setSubmitting(false); setSuccess(false); setError('')
  }

  const handleClose = () => { reset(); onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const payload: Record<string, any> = { nome, email }
      if (telefone) payload.telefone = telefone
      if (profissao) payload.profissao = profissao
      if (mensagem) payload.mensagem = mensagem
      if (campaignId) {
        payload.campaignId = Number(campaignId)
        await api.publicExpressInterest(slug, Number(campaignId), payload)
      } else {
        await api.publicVolunteerIntent(slug, payload)
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Não foi possível registrar sua inscrição.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={success ? 'Inscrição recebida!' : 'Quero ser voluntário'} size="md">
      {success ? (
        <div className="py-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-50 border-4 border-sky-100 mx-auto flex items-center justify-center">
            <CheckCircle2 size={32} className="text-sky-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">Obrigado por se inscrever!</p>
            <p className="text-slate-600 text-sm mt-1">
              A coordenação {orgName ? <strong>de {orgName}</strong> : 'da organização'} vai analisar sua candidatura e entrar em contato em <strong>{email}</strong>.
            </p>
          </div>
          <button type="button" onClick={handleClose} className="btn-primary w-full justify-center">Fechar</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-600">
            <Users size={16} className="inline -mt-0.5 mr-1 text-brand-600" />
            Preencha o cadastro e a equipe entra em contato para combinar sua participação.
          </p>

          {campaigns.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Campanha de interesse (opcional)</label>
              <select className="input mt-2" value={campaignId} onChange={e => setCampaignId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Qualquer causa / aberto a conhecer</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome *</label>
              <input required className="input mt-2" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail *</label>
              <input required type="email" className="input mt-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">WhatsApp (opcional)</label>
              <input className="input mt-2" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Profissão / Área (opcional)</label>
              <input className="input mt-2" value={profissao} onChange={e => setProfissao(e.target.value)} placeholder="Ex: designer, médico, educador" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Como você quer contribuir? (opcional)</label>
            <textarea rows={3} className="input mt-2" value={mensagem} onChange={e => setMensagem(e.target.value)}
              placeholder="Conte um pouco sobre sua disponibilidade e experiência" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><Users size={16} /> Quero ajudar</>}
          </button>
        </form>
      )}
    </Modal>
  )
}
