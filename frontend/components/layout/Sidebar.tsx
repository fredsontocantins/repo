'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, Megaphone, Heart, Trophy, FileBarChart,
  Calendar, Settings, LogOut, Leaf, Award, Globe,
  UsersRound, ChevronRight, Building2, Wallet, Inbox,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { clsx } from 'clsx'

type NavItem = {
  href: string
  label: string
  icon: any
  badge?: number
}

const gestaoBase: NavItem[] = [
  { href: '/dashboard',            label: 'Dashboard',              icon: LayoutDashboard },
  { href: '/volunteers',           label: 'Voluntários',            icon: Users },
  { href: '/volunteer-interests',  label: 'Interesses (Portal)',    icon: Inbox },
  { href: '/campaigns',            label: 'Campanhas',              icon: Megaphone },
  { href: '/donations',            label: 'Doações',                icon: Heart },
  { href: '/events',               label: 'Eventos',                icon: Calendar },
  { href: '/gamification',         label: 'Gamificação',            icon: Trophy },
  { href: '/reports',              label: 'Relatórios',             icon: FileBarChart },
  { href: '/finance',              label: 'Financeiro',             icon: Wallet },
]

const adminItems: NavItem[] = [
  { href: '/admin/members',      label: 'Equipe Interna', icon: UsersRound },
  { href: '/admin/certificates', label: 'Certificados',   icon: Award },
  { href: '/settings',           label: 'Configurações',  icon: Settings },
]

function NavSection({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mb-2">
      <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.6em] text-[rgba(191,201,247,0.75)]">{title}</p>
      {items.map(({ href, label, icon: Icon, badge }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link key={href} href={href}
            className={clsx('sidebar-link', active && 'active')}>
            <Icon size={16} />
            <span className="flex-1 text-[14px]">{label}</span>
            {badge && badge > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full bg-amber-400 text-brand-900 text-[10px] font-bold">
                {badge > 99 ? '99+' : badge}
              </span>
            ) : active ? (
              <ChevronRight size={13} className="text-white/70" />
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const slug = user?.organization?.slug || 'voluntarios-unidos'
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')
  const [pendingInterests, setPendingInterests] = useState(0)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const fetchPending = async () => {
      try {
        const s = await api.getCampaignInterestStats()
        if (!cancelled) setPendingInterests(s?.PENDING ?? 0)
      } catch {
        /* silent — endpoint may 403 for basic roles */
      }
    }
    fetchPending()
    const intv = setInterval(fetchPending, 60_000)
    return () => { cancelled = true; clearInterval(intv) }
  }, [user, pathname])

  const gestaoItems: NavItem[] = gestaoBase.map(i =>
    i.href === '/volunteer-interests' ? { ...i, badge: pendingInterests } : i,
  )

  return (
    <aside className="fixed left-0 top-0 h-screen z-40 sidebar-shell">
      {/* Logo */}
      <div className="px-3 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl logo-mark flex items-center justify-center text-white flex-shrink-0">
            <Leaf size={17} />
          </div>
          <div>
            <p className="text-white font-bold text-sm font-display leading-none">Voluntários</p>
            <p className="text-[11px] mt-0.5 text-[rgba(191,201,247,0.85)]">Portal de Gestão</p>
          </div>
        </div>
      </div>

      {/* Org */}
      {user?.organization && (
        <div className="px-3 py-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Building2 size={13} className="text-[rgba(191,201,247,0.8)] flex-shrink-0" />
            <p className="text-[11px] text-[rgba(191,201,247,0.9)] truncate">{user.organization.name}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <NavSection title="Gestão" items={gestaoItems} pathname={pathname} />
        {isAdmin && (
          <div className="pt-2 border-t border-white/10">
            <NavSection title="Administrativo" items={adminItems} pathname={pathname} />
          </div>
        )}

        {/* Portal Público link */}
        <div className="pt-2 border-t border-white/10">
          <Link
            href={`/portal/${slug}`}
            target="_blank"
            className="portal-link"
          >
            <Globe size={15} />
            <span className="flex-1">Ver Portal Público</span>
            <span className="text-[10px]">↗</span>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl logo-mark flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || 'Usuário'}</p>
            <p className="text-[10px] text-[rgba(191,201,247,0.75)]">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[rgba(191,201,247,0.8)] hover:text-pink-300 hover:bg-[rgba(236,72,153,0.12)] rounded-xl text-xs transition-all duration-150">
          <LogOut size={13} /><span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
