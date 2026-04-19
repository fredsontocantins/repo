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
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg,#0a1a30 0%,#112a4a 60%,#193e6b 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
               style={{ background: 'linear-gradient(135deg,#5e8abb,#22518a)' }}>
            <Leaf size={24} className="text-white" />
          </div>
          <p className="text-brand-200 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
