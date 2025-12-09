import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { ArrowRight, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RecentTenantsProps {
  tenants: any[]
}

export function RecentTenants({ tenants }: RecentTenantsProps) {
  if (!tenants || tenants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenants Recentes</CardTitle>
          <CardDescription>Últimos tenants cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <Building2 className="h-12 w-12 mb-2" />
            <p>Nenhum tenant cadastrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenants Recentes</CardTitle>
        <CardDescription>Últimos tenants cadastrados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tenants.map((tenant) => {
          const subscription = tenant.subscriptions?.[0]
          const statusLabel = subscription?.status === 'ACTIVE' ? 'Ativo' :
                             subscription?.status === 'TRIALING' ? 'Trial' :
                             subscription?.status === 'PAST_DUE' ? 'Atrasado' : 'Inativo'
          const statusVariant = subscription?.status === 'ACTIVE' ? 'success' :
                               subscription?.status === 'TRIALING' ? 'default' :
                               subscription?.status === 'PAST_DUE' ? 'warning' : 'secondary'

          return (
            <Link
              key={tenant.id}
              href={`/super-admin/tenants/${tenant.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text group-hover:text-primary transition-colors">
                    {tenant.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {formatDate(tenant.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
                <ArrowRight className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" />
              </div>
            </Link>
          )
        })}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/super-admin/tenants">Ver todos os tenants</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
