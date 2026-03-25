'use client'
import { create } from 'zustand'
import type { ModuleAccess } from '@/lib/permissions'

interface User {
  id: number
  name: string
  email: string
  role: string
  organization?: any
  modules?: ModuleAccess[]
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    const normalized = { ...user, modules: user.modules ?? [] }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(normalized))
    set({ user: normalized, token })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
    window.location.href = '/auth/login'
  },
  hydrate: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user: { ...user, modules: user.modules ?? [] }, token })
      } catch {}
    }
  },
}))
