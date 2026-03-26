import Sidebar from './Sidebar'
import AuthGuard from './AuthGuard'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="main-shell">
        <Sidebar />
        <main className="flex-1 ml-[260px] content-shell">
          <div className="p-8 animate-fadeIn space-y-6">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
