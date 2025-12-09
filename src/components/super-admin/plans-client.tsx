'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plan } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Power, Trash2, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { togglePlanStatus, deletePlan } from '@/actions/super-admin/plans'
import { PlanFormModal } from './plan-form-modal'

type PlanWithCount = Plan & {
  _count: {
    subscriptions: number
  }
}

interface PlansClientProps {
  plans: PlanWithCount[]
}

export function PlansClient({ plans }: PlansClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanWithCount | null>(null)

  const handleToggleStatus = async (planId: string) => {
    const result = await togglePlanStatus(planId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Erro ao alterar status')
    }
  }

  const handleDelete = async (plan: PlanWithCount) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar o plano "${plan.name}"? Esta ação não pode ser desfeita!`
      )
    ) {
      return
    }

    const result = await deletePlan(plan.id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Erro ao deletar plano')
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              !plan.isActive ? 'opacity-60' : ''
            } ${plan.isFeatured ? 'border-primary border-2' : ''}`}
          >
            {plan.isFeatured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Destaque</Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {!plan.isActive && (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </CardTitle>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="space-y-2">
                <div>
                  <span className="text-3xl font-bold">
                    {formatCurrency(Number(plan.monthlyPrice))}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ou {formatCurrency(Number(plan.yearlyPrice))}/ano
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Máx. Alunos:</span>
                  <span className="font-medium">{plan.maxStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Máx. Cursos:</span>
                  <span className="font-medium">{plan.maxCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Armazenamento:</span>
                  <span className="font-medium">{plan.maxStorage} GB</span>
                </div>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Recursos:</div>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stats */}
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {plan._count.subscriptions} assinatura
                  {plan._count.subscriptions !== 1 ? 's' : ''} ativa
                  {plan._count.subscriptions !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingPlan(plan)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(plan.id)}
                >
                  <Power className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(plan)}
                  disabled={plan._count.subscriptions > 0}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum plano cadastrado
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {isCreating && (
        <PlanFormModal
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false)
            router.refresh()
          }}
        />
      )}

      {/* Edit Modal */}
      {editingPlan && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSuccess={() => {
            setEditingPlan(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
