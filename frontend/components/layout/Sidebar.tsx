'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Megaphone, Heart, Trophy, FileBarChart,
  Calendar, Settings, LogOut, Leaf, Award, Globe, KeyRound,
  UsersRound, ChevronRight, Building2, Wallet
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { clsx } from 'clsx'

const gestaoItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/volunteers',    label: 'Voluntários',   icon: Users },
  { href: '/campaigns',     label: 'Campanhas',     icon: Megaphone },
  { href: '/donations',     label: 'Doações',       icon: Heart },
  { href: '/events',        label: 'Eventos',       icon: Calendar },
  { href: '/gamification',  label: 'Gamificação',   icon: Trophy },
  { href: '/reports',       label: 'Relatórios',    icon: FileBarChart },
  { href: '/finance',        label: 'Financeiro',    icon: Wallet },
]

const adminItems = [
  { href: '/admin/users',         label: 'Controle de Usuários', icon: KeyRound },
  { href: '/admin/members',      label: 'Equipe Interna',       icon: UsersRound },
  { href: '/admin/certificates', label: 'Certificados',         icon: Award },
  { href: '/settings',           label: 'Configurações',        icon: Settings },
]

function NavSection({ title, items, pathname }: { title: string; items: typeof gestaoItems; pathname: string }) {
  return (
    <div className="mb-2">
      <p className="px-3 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{title}</p>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link key={href} href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
              active
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}>
            <Icon size={16} className={clsx(active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
            <span className="flex-1">{label}</span>
            {active && <ChevronRight size={13} className="text-white/50" />}
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
            <Leaf size={17} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm font-display leading-none">Voluntários</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Portal de Gestão</p>
          </div>
        </div>
      </div>

      {/* Org */}
      {user?.organization && (
        <div className="px-5 py-2.5 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Building2 size={13} className="text-slate-600 flex-shrink-0" />
            <p className="text-slate-400 text-xs truncate">{user.organization.name}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <NavSection title="Gestão" items={gestaoItems} pathname={pathname} />
        {isAdmin && (
          <div className="pt-2 border-t border-slate-800/60">
            <NavSection title="Administrativo" items={adminItems} pathname={pathname} />
          </div>
        )}

        {/* Portal Público link */}
        <div className="pt-2 border-t border-slate-800/60">
          <Link
            href={`/portal/${slug}`}
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-brand-400 hover:bg-slate-800/50 transition-all group"
          >
            <Globe size={15} className="text-slate-600 group-hover:text-brand-400" />
            <span className="flex-1">Ver Portal Público</span>
            <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">↗</span>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || 'Usuário'}</p>
            <p className="text-slate-500 text-[10px]">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl text-xs transition-all duration-150">
          <LogOut size={13} /><span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
