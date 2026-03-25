'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center animate-pulse">
          <Leaf size={24} className="text-white" />
        </div>
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    </div>
  )
}
