import { getPlans } from '@/actions/super-admin/plans'
import { TenantForm } from '@/components/super-admin/tenant-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewTenantPage() {
  const plansResult = await getPlans()

  if (!plansResult.success) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Erro ao carregar planos</p>
      </div>
    )
  }

  const plans = plansResult.data || []

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/super-admin/tenants">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-text">Novo Tenant</h1>
        <p className="text-text-secondary mt-2">
          Cadastre um novo cliente na plataforma
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Tenant</CardTitle>
          <CardDescription>
            Preencha os dados do cliente e escolha o plano de assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantForm plans={plans} />
        </CardContent>
      </Card>
    </div>
  )
}
