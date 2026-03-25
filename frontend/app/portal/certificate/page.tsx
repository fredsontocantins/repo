'use client'
import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Search, CheckCircle2, XCircle, Leaf, Shield, Download, ArrowLeft, Award, Building2, Calendar, Clock, User } from 'lucide-react'

export default function CertificateVerifyPage() {
  const [codigo, setCodigo] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.verifyCertificate(codigo.trim().toUpperCase())
      setResult(res)
    } catch (e: any) {
      setError(e.message || 'Certificado não encontrado')
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  const TIPO_LABEL: Record<string, string> = {
    PARTICIPATION: 'Certificado de Participação',
    HOURS: 'Certificado de Horas Voluntariadas',
    ACHIEVEMENT: 'Certificado de Conquista',
    RECOGNITION: 'Certificado de Reconhecimento',
  }

  const cert = result?.certificado

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-slate-800">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#060d1f]/90 backdrop-blur-xl no-print">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-800">Verificação de Certificado</span>
          </div>
          <Link href="/" className="text-slate-500 hover:text-emerald-600 text-sm flex items-center gap-1 font-semibold bg-emerald-50 px-3 py-2 rounded-xl transition-colors">
            <ArrowLeft size={14} /> Início
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 no-print">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Shield size={28} className="text-emerald-500" />
          </div>
          <h1 className="text-4xl font-black font-display text-slate-900 mb-3">Verificar Certificado</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Digite o código do certificado para confirmar sua autenticidade e validade.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              className="w-full bg-white border border-emerald-200 rounded-xl shadow-sm px-4 py-3.5 pl-11 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all font-mono text-sm tracking-widest"
              placeholder="VOL-2024-XXXXXX"
              autoComplete="off"
            />
          </div>
          <button type="submit" disabled={loading || !codigo.trim()}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm">
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <XCircle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Revoked */}
        {result && result.revogado && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <XCircle size={36} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-600 mb-1">Certificado Revogado</h2>
            <p className="text-slate-600 text-sm">{result.motivoRevogacao || 'Este certificado foi revogado pela organização emissora.'}</p>
          </div>
        )}
      </div>

      {/* Valid Certificate - renders for both screen and print */}
      {cert && !result.revogado && (
        <>
          {/* Screen action bar */}
          <div className="max-w-3xl mx-auto px-6 mb-6 no-print">
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-300 text-sm font-medium flex-1">Certificado válido e autêntico</p>
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all">
                <Download size={14} /> Imprimir / Salvar PDF
              </button>
            </div>
          </div>

          {/* Certificate card - prints beautifully */}
          <div className="max-w-3xl mx-auto px-6 pb-16 cert-page">
            <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl" style={{ fontFamily: 'Georgia, serif' }}>
              {/* Top accent bar */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              {/* Header */}
              <div className="px-12 pt-10 pb-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <Leaf size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base leading-none">{cert.organization?.name}</p>
                      {cert.organization?.city && (
                        <p className="text-slate-400 text-xs mt-0.5">{cert.organization.city}, {cert.organization.state}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Código de verificação</p>
                    <p className="font-mono font-bold text-slate-700 text-sm mt-0.5">{cert.codigo}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-12 py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 mb-6">
                  <Award size={28} className="text-emerald-500" />
                </div>

                <p className="text-slate-400 text-sm uppercase tracking-[0.2em] mb-3">
                  {TIPO_LABEL[cert.tipo] || 'Certificado'}
                </p>

                <h1 className="text-4xl font-black text-slate-900 mb-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {cert.titulo}
                </h1>

                <p className="text-slate-400 text-sm mb-8">Certificamos que</p>

                <div className="inline-block border-b-2 border-emerald-400 mb-3 px-8">
                  <p className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
                    {cert.volunteer?.nome}
                  </p>
                </div>

                {cert.volunteer?.profissao && (
                  <p className="text-slate-500 text-sm mb-6">{cert.volunteer.profissao}</p>
                )}

                {cert.descricao && (
                  <p className="text-slate-600 text-base max-w-lg mx-auto leading-relaxed mb-8">{cert.descricao}</p>
                )}

                <div className="flex items-center justify-center gap-8 py-6 border-t border-b border-slate-100 mb-8">
                  {cert.horasCertificadas && (
                    <div className="text-center">
                      <p className="text-2xl font-black text-emerald-600">{cert.horasCertificadas}h</p>
                      <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Horas Certificadas</p>
                    </div>
                  )}
                  {cert.campaign && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">{cert.campaign.nome}</p>
                      <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Campanha</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(cert.dataEmissao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Data de Emissão</p>
                  </div>
                  {cert.dataValidade && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(cert.dataValidade).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Válido até</p>
                    </div>
                  )}
                </div>

                {cert.assinante && (
                  <div className="mt-2">
                    <div className="inline-block">
                      <p className="font-bold text-slate-800 text-base">{cert.assinante}</p>
                      {cert.cargoAssinante && <p className="text-slate-400 text-xs mt-0.5 text-center">{cert.cargoAssinante}</p>}
                      <div className="mt-2 border-t border-slate-300 pt-2">
                        <p className="text-slate-300 text-[10px] text-center">{cert.organization?.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-12 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-xs">
                    Verificado em: <span className="font-mono font-semibold text-slate-600">{cert.codigo}</span>
                  </p>
                  <p className="text-slate-400 text-xs">
                    {window.location.origin}/portal/certificate
                  </p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
