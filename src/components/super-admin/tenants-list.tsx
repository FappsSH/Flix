'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Building2, Users, BookOpen, Eye, Power } from 'lucide-react'
import { toggleTenantStatus } from '@/actions/super-admin/tenants'
import { useRouter } from 'next/navigation'

interface Tenant {
  id: string
  name: string
  slug: string
  subdomain: string | null
  domain: string | null
  isActive: boolean
  createdAt: Date
  subscriptions: {
    status: string
    interval: string
    plan: {
      name: string
      monthlyPrice: number
      yearlyPrice: number
    }
  }[]
  _count: {
    users: number
    courses: number
  }
}

interface TenantsListProps {
  tenants: Tenant[]
}

export function TenantsList({ tenants }: TenantsListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleStatus = async (id: string) => {
    if (loadingId) return

    if (!confirm('Deseja alterar o status deste tenant?')) return

    setLoadingId(id)
    const result = await toggleTenantStatus(id)
    setLoadingId(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Erro ao alterar status')
    }
  }

  if (tenants.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="h-16 w-16 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text mb-2">
          Nenhum tenant cadastrado
        </h3>
        <p className="text-text-secondary mb-6">
          Comece criando seu primeiro cliente
        </p>
        <Button asChild>
          <Link href="/super-admin/tenants/new">Criar Primeiro Tenant</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {tenants.map((tenant) => {
        const subscription = tenant.subscriptions[0]
        const statusLabel = subscription?.status === 'ACTIVE' ? 'Ativo' :
                           subscription?.status === 'TRIALING' ? 'Trial' :
                           subscription?.status === 'PAST_DUE' ? 'Atrasado' : 'Inativo'
        const statusVariant = subscription?.status === 'ACTIVE' ? 'success' :
                             subscription?.status === 'TRIALING' ? 'default' :
                             subscription?.status === 'PAST_DUE' ? 'warning' : 'secondary'

        const price = subscription?.interval === 'MONTHLY'
          ? subscription.plan.monthlyPrice
          : subscription?.plan.yearlyPrice || 0

        return (
          <Card key={tenant.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text truncate">
                      {tenant.name}
                    </h3>
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                    {!tenant.isActive && (
                      <Badge variant="destructive">Desativado</Badge>
                    )}
                  </div>

                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Slug:</span> {tenant.slug}
                    </p>
                    {tenant.subdomain && (
                      <p className="text-sm text-text-secondary">
                        <span className="font-medium">Subdomínio:</span> {tenant.subdomain}
                      </p>
                    )}
                    {tenant.domain && (
                      <p className="text-sm text-text-secondary">
                        <span className="font-medium">Domínio:</span> {tenant.domain}
                      </p>
                    )}
                    {subscription && (
                      <p className="text-sm text-text-secondary">
                        <span className="font-medium">Plano:</span> {subscription.plan.name} -{' '}
                        {formatCurrency(price)}/{subscription.interval === 'MONTHLY' ? 'mês' : 'ano'}
                      </p>
                    )}
                    <p className="text-sm text-text-muted">
                      Cadastrado em {formatDate(tenant.createdAt)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">{tenant._count.users} alunos</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm font-medium">{tenant._count.courses} cursos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleStatus(tenant.id)}
                  disabled={loadingId === tenant.id}
                  title={tenant.isActive ? 'Desativar' : 'Ativar'}
                >
                  <Power className={`h-4 w-4 ${tenant.isActive ? 'text-success' : 'text-text-muted'}`} />
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/super-admin/tenants/${tenant.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
