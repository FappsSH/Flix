import Link from 'next/link'
import { getTenants } from '@/actions/super-admin/tenants'
import { Button } from '@/components/ui/button'
import { TenantsList } from '@/components/super-admin/tenants-list'
import { Plus } from 'lucide-react'

export default async function TenantsPage() {
  const result = await getTenants()

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Erro ao carregar tenants</p>
      </div>
    )
  }

  const tenants = result.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Tenants</h1>
          <p className="text-text-secondary mt-2">
            Gerencie os clientes da plataforma
          </p>
        </div>
        <Button asChild>
          <Link href="/super-admin/tenants/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tenant
          </Link>
        </Button>
      </div>

      {/* Tenants List */}
      <TenantsList tenants={tenants} />
    </div>
  )
}
