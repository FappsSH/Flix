import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTenantById } from '@/lib/tenant'
import { Navbar } from '@/components/student/navbar'
import { generateTenantTheme, generateThemeCSS } from '@/lib/theme'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verifica autenticação
  const session = await getServerSession(authOptions)

  // Se não está autenticado, redireciona para login
  if (!session) {
    redirect('/login?callbackUrl=/browse')
  }

  // Se não é aluno, redireciona
  if (session.user.role !== 'STUDENT') {
    if (session.user.role === 'SUPER_ADMIN') {
      redirect('/super-admin/dashboard')
    }
    if (session.user.role === 'TENANT_ADMIN') {
      redirect('/admin/dashboard')
    }
    redirect('/unauthorized')
  }

  // Busca tenant
  const tenantId = session.user.tenantId
  if (!tenantId) {
    redirect('/unauthorized')
  }

  const tenant = await getTenantById(tenantId)

  if (!tenant) {
    redirect('/unauthorized')
  }

  // Gera tema do tenant
  const theme = generateTenantTheme({
    id: tenant.id,
    slug: tenant.slug,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    logo: tenant.logo,
    fontFamily: tenant.fontFamily,
  })

  const themeCSS = generateThemeCSS(theme)

  return (
    <div className="min-h-screen bg-background" data-tenant={tenant.slug}>
      {/* Inject tenant theme */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      {/* Navbar */}
      <Navbar
        user={session.user}
        tenantName={tenant.name}
        logo={tenant.logo}
      />

      {/* Main content */}
      <main className="pt-16 md:pt-20">
        {children}
      </main>
    </div>
  )
}
