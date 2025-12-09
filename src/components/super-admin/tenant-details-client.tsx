'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tenant, Subscription, Plan } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  Globe,
  Palette,
  Calendar,
  Users,
  BookOpen,
  Award,
  Power,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toggleTenantStatus, deleteTenant } from '@/actions/super-admin/tenants'
import { TenantEditModal } from './tenant-edit-modal'

type TenantWithDetails = Tenant & {
  subscriptions: (Subscription & { plan: Plan })[]
  _count: {
    users: number
    courses: number
    certificates: number
  }
}

interface TenantDetailsClientProps {
  tenant: TenantWithDetails
}

export function TenantDetailsClient({ tenant }: TenantDetailsClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentSubscription = tenant.subscriptions[0]

  const handleToggleStatus = async () => {
    if (
      !confirm(
        `Tem certeza que deseja ${tenant.isActive ? 'desativar' : 'ativar'} este tenant?`
      )
    ) {
      return
    }

    setIsToggling(true)
    const result = await toggleTenantStatus(tenant.id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Erro ao alterar status')
    }

    setIsToggling(false)
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Tem certeza que deseja deletar este tenant? Esta ação não pode ser desfeita!'
      )
    ) {
      return
    }

    setIsDeleting(true)
    const result = await deleteTenant(tenant.id)

    if (result.success) {
      router.push('/super-admin/tenants')
    } else {
      alert(result.error || 'Erro ao deletar tenant')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/super-admin/tenants')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">
              Criado em {formatDate(tenant.createdAt)}
            </p>
          </div>
          <Badge variant={tenant.isActive ? 'default' : 'destructive'}>
            {tenant.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={isToggling}
          >
            <Power className="h-4 w-4 mr-2" />
            {tenant.isActive ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant._count.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant._count.courses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenant._count.certificates}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome
              </label>
              <p className="text-lg">{tenant.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Slug
              </label>
              <p className="font-mono">{tenant.slug}</p>
            </div>

            {tenant.subdomain && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Subdomínio
                </label>
                <a
                  href={`https://${tenant.subdomain}.seudominio.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {tenant.subdomain}.seudominio.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {tenant.domain && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domínio Customizado
                </label>
                <a
                  href={`https://${tenant.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {tenant.domain}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Cor Primária
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: tenant.primaryColor }}
                />
                <span className="font-mono">{tenant.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Cor Secundária
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: tenant.secondaryColor }}
                />
                <span className="font-mono">{tenant.secondaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Fonte
              </label>
              <p className="text-lg" style={{ fontFamily: tenant.fontFamily }}>
                {tenant.fontFamily}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Assinatura Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Plano
                  </label>
                  <p className="text-lg font-medium">
                    {currentSubscription.plan.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentSubscription.plan.description}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        currentSubscription.status === 'ACTIVE'
                          ? 'default'
                          : currentSubscription.status === 'TRIALING'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {currentSubscription.status === 'ACTIVE' && 'Ativo'}
                      {currentSubscription.status === 'TRIALING' && 'Em Trial'}
                      {currentSubscription.status === 'PAST_DUE' &&
                        'Pagamento Atrasado'}
                      {currentSubscription.status === 'CANCELED' && 'Cancelado'}
                      {currentSubscription.status === 'INCOMPLETE' &&
                        'Incompleto'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Valor
                  </label>
                  <p className="text-lg font-medium">
                    {formatCurrency(
                      Number(
                        currentSubscription.interval === 'MONTHLY'
                          ? currentSubscription.plan.monthlyPrice
                          : currentSubscription.plan.yearlyPrice
                      )
                    )}
                    <span className="text-sm text-muted-foreground">
                      {currentSubscription.interval === 'MONTHLY'
                        ? '/mês'
                        : '/ano'}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Período Atual
                  </label>
                  <p className="text-sm">
                    {formatDate(currentSubscription.currentPeriodStart)} -{' '}
                    {formatDate(currentSubscription.currentPeriodEnd)}
                  </p>
                </div>

                {currentSubscription.trialStart &&
                  currentSubscription.trialEnd && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Período de Trial
                      </label>
                      <p className="text-sm">
                        {formatDate(currentSubscription.trialStart)} -{' '}
                        {formatDate(currentSubscription.trialEnd)}
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription History */}
        {tenant.subscriptions.length > 1 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Histórico de Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenant.subscriptions.slice(1).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{sub.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(sub.currentPeriodStart)} -{' '}
                        {formatDate(sub.currentPeriodEnd)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        sub.status === 'ACTIVE'
                          ? 'default'
                          : sub.status === 'TRIALING'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <TenantEditModal
          tenant={tenant}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
