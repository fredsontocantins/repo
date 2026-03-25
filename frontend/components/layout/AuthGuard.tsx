'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Leaf } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, hydrate } = useAuthStore()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate()
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !user) {
      const token = localStorage.getItem('token')
      if (!token) router.replace('/auth/login')
    }
  }, [ready, user])

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Leaf size={24} className="text-white" />
          </div>
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
