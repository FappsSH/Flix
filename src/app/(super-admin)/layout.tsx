import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SuperAdminSidebar } from '@/components/layout/super-admin/sidebar'
import { SuperAdminHeader } from '@/components/layout/super-admin/header'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verifica autenticação
  const session = await getServerSession(authOptions)

  // Se não está autenticado, redireciona para login
  if (!session) {
    redirect('/login?callbackUrl=/super-admin/dashboard')
  }

  // Se não é Super Admin, redireciona para unauthorized
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <SuperAdminHeader user={session.user} />

        {/* Page content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
