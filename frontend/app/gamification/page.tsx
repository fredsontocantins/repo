'use client'
import { useEffect, useState } from 'react'
import { Trophy, Star, Award, Crown, Medal, Zap } from 'lucide-react'
import { api } from '@/lib/api'

const rankIcons = [Crown, Trophy, Medal]
const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700']
const rankBgs = ['bg-amber-50 border-amber-200', 'bg-slate-50 border-slate-200', 'bg-orange-50 border-orange-200']

export default function GamificationPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getLeaderboard(), api.getBadges(), api.getGamificationStats()])
      .then(([lb, b, s]) => { setLeaderboard(lb); setBadges(b); setStats(s) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-36 animate-pulse" />)}</div>
    </div>
  )

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Gamificação</h1>
        <p className="text-slate-500 text-sm mt-1">Ranking e conquistas dos voluntários</p>
      </div>

      {/* Global stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Zap size={22} className="text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 font-display">{fmt(stats.totalPoints)}</p>
            <p className="text-sm text-slate-500 mt-1">Pontos distribuídos</p>
          </div>
          <div className="card p-5 text-center">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Award size={22} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 font-display">{fmt(stats.totalBadgesAwarded)}</p>
            <p className="text-sm text-slate-500 mt-1">Badges conquistados</p>
          </div>
          <div className="card p-5 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trophy size={22} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 font-display">{leaderboard.length}</p>
            <p className="text-sm text-slate-500 mt-1">No ranking</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="section-title">🏆 Top Voluntários</h2>

          {/* Podium top 3 */}
          <div className="grid grid-cols-3 gap-3">
            {top3.map((v: any, i: number) => {
              const RankIcon = rankIcons[i]
              return (
                <div key={v.id} className={`card p-5 text-center border ${rankBgs[i]} ${i === 0 ? 'ring-2 ring-amber-300' : ''}`}>
                  <div className="flex justify-center mb-2">
                    <RankIcon size={24} className={rankColors[i]} />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                    {v.nome[0].toUpperCase()}
                  </div>
                  <p className="font-semibold text-slate-900 text-sm leading-tight">{v.nome}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{v.profissao || '—'}</p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900 text-sm">{fmt(v.pontos)}</span>
                    <span className="text-slate-400 text-xs">pts</span>
                  </div>
                  {v.badges?.length > 0 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {v.badges.map((b: any) => <span key={b.id} className="text-base">{b.badge.icone}</span>)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div className="card divide-y divide-slate-50">
              {rest.map((v: any, i: number) => (
                <div key={v.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <span className="text-sm font-bold text-slate-400 w-6">{i + 4}</span>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-sm">
                    {v.nome[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{v.nome}</p>
                    <p className="text-slate-400 text-xs">{v.profissao || '—'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {v.badges?.slice(0, 3).map((b: any) => <span key={b.id} className="text-sm">{b.badge.icone}</span>)}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900 text-sm">{fmt(v.pontos)}</span>
                    </div>
                    <p className="text-xs text-slate-400">{v.horasContribuidas}h</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div>
          <h2 className="section-title mb-4">🎖️ Badges Disponíveis</h2>
          <div className="space-y-3">
            {badges.map((b: any) => (
              <div key={b.id} className="card p-4 flex items-center gap-4">
                <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-2xl" style={{ background: b.cor + '20' }}>
                  {b.icone}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{b.nome}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{b.descricao}</p>
                  {b.pontosReq > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-amber-700 font-medium">{fmt(b.pontosReq)} pontos</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
