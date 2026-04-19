'use client'
import { useState } from 'react'
import { CheckCircle2, HandHeart, Loader2 } from 'lucide-react'
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

const PRESETS = [25, 50, 100, 250, 500]
const TIPOS = [
  { value: 'MONETARY', label: 'Dinheiro (PIX)', icon: '💰' },
  { value: 'FOOD', label: 'Alimento', icon: '🍎' },
  { value: 'CLOTHING', label: 'Roupa', icon: '👕' },
  { value: 'MEDICINE', label: 'Remédio', icon: '💊' },
  { value: 'EQUIPMENT', label: 'Equipamento', icon: '🧰' },
  { value: 'OTHER', label: 'Outro', icon: '📦' },
]

export default function DonateModal({ open, onClose, slug, orgName, campaigns = [], defaultCampaignId }: Props) {
  const [tipo, setTipo] = useState('MONETARY')
  const [valor, setValor] = useState<number | ''>(100)
  const [campaignId, setCampaignId] = useState<number | ''>(defaultCampaignId ?? '')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setTipo('MONETARY'); setValor(100); setCampaignId(defaultCampaignId ?? '')
    setNome(''); setEmail(''); setTelefone(''); setMensagem('')
    setSubmitting(false); setSuccess(false); setError('')
  }

  const handleClose = () => { reset(); onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const payload: Record<string, any> = { nome, email, tipo }
      if (telefone) payload.telefone = telefone
      if (mensagem) payload.mensagem = mensagem
      if (tipo === 'MONETARY' && valor) payload.valor = Number(valor)
      if (campaignId) payload.campaignId = Number(campaignId)
      await api.publicDonationIntent(slug, payload)
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Não foi possível registrar sua doação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={success ? 'Doação registrada!' : 'Quero doar'} size="md">
      {success ? (
        <div className="py-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 mx-auto flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">Obrigado por doar!</p>
            <p className="text-slate-600 text-sm mt-1">
              Registramos sua intenção e a equipe {orgName ? <strong>{orgName}</strong> : 'da organização'} vai entrar em contato em <strong>{email}</strong> com as instruções para concluir sua doação.
            </p>
          </div>
          <button type="button" onClick={handleClose} className="btn-primary w-full justify-center">Fechar</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-600">
            <HandHeart size={16} className="inline -mt-0.5 mr-1 text-brand-600" />
            Preencha seus dados e a equipe entra em contato para confirmar a doação.
          </p>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tipo de doação</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TIPOS.map(t => (
                <button key={t.value} type="button"
                  onClick={() => setTipo(t.value)}
                  className={`rounded-xl border-2 p-2.5 text-xs font-semibold transition ${
                    tipo === t.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}>
                  <span className="block text-lg mb-0.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tipo === 'MONETARY' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Valor (R$)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button key={p} type="button" onClick={() => setValor(p)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition ${
                      valor === p ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 text-slate-700 hover:border-brand-300'
                    }`}>
                    R$ {p}
                  </button>
                ))}
                <input type="number" min={1} placeholder="Outro valor"
                  className="input flex-1 min-w-[120px]"
                  value={typeof valor === 'number' && !PRESETS.includes(valor) ? valor : ''}
                  onChange={e => setValor(e.target.value ? Number(e.target.value) : '')} />
              </div>
            </div>
          )}

          {campaigns.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destinar para (opcional)</label>
              <select className="input mt-2" value={campaignId} onChange={e => setCampaignId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Onde for mais necessário</option>
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

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">WhatsApp / telefone (opcional)</label>
            <input className="input mt-2" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mensagem (opcional)</label>
            <textarea rows={2} className="input mt-2" value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Deixe uma mensagem para a equipe" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><HandHeart size={16} /> Doar agora</>}
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Sua doação ainda será confirmada pela equipe da organização. Nenhum pagamento é feito nesta etapa.
          </p>
        </form>
      )}
    </Modal>
  )
}
