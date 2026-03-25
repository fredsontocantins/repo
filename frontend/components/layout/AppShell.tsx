import Sidebar from './Sidebar'
import AuthGuard from './AuthGuard'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-[260px] min-h-screen">
          <div className="p-8 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
