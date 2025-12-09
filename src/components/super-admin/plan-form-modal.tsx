'use client'

import { useState } from 'react'
import { Plan } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, Trash2 } from 'lucide-react'
import { createPlan, updatePlan } from '@/actions/super-admin/plans'
import { generateSlug } from '@/lib/utils'

interface PlanFormModalProps {
  plan?: Plan
  onClose: () => void
  onSuccess: () => void
}

export function PlanFormModal({ plan, onClose, onSuccess }: PlanFormModalProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    slug: plan?.slug || '',
    description: plan?.description || '',
    monthlyPrice: plan?.monthlyPrice ? Number(plan.monthlyPrice) : 0,
    yearlyPrice: plan?.yearlyPrice ? Number(plan.yearlyPrice) : 0,
    maxStudents: plan?.maxStudents || 100,
    maxCourses: plan?.maxCourses || 10,
    maxStorage: plan?.maxStorage || 50,
    features: plan?.features || [],
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured ?? false,
    position: plan?.position || 0,
    stripePriceIdMonthly: plan?.stripePriceIdMonthly || '',
    stripePriceIdYearly: plan?.stripePriceIdYearly || '',
  })

  const [newFeature, setNewFeature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const dataToSubmit = {
      ...formData,
      stripePriceIdMonthly: formData.stripePriceIdMonthly || undefined,
      stripePriceIdYearly: formData.stripePriceIdYearly || undefined,
    }

    const result = plan
      ? await updatePlan(plan.id, dataToSubmit)
      : await createPlan(dataToSubmit as any)

    setIsSubmitting(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Erro ao salvar plano')
    }
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: !plan ? generateSlug(name) : formData.slug,
    })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background z-10">
          <h2 className="text-2xl font-bold">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações Básicas</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Plano Básico"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="plano-basico"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ideal para pequenos negócios"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Preços</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Preço Mensal (R$) *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlyPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="99.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearlyPrice">Preço Anual (R$) *</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.yearlyPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearlyPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="990.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Limites</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Máx. Alunos *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxStudents: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCourses">Máx. Cursos *</Label>
                <Input
                  id="maxCourses"
                  type="number"
                  min="1"
                  value={formData.maxCourses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCourses: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStorage">Armazenamento (GB) *</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  min="1"
                  value={formData.maxStorage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxStorage: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Recursos</h3>

            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Adicionar recurso..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <Button type="button" onClick={addFeature}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.features.length > 0 && (
              <ul className="space-y-2">
                {formData.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Stripe IDs (Optional) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stripe (Opcional)</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stripePriceIdMonthly">
                  Price ID Mensal
                </Label>
                <Input
                  id="stripePriceIdMonthly"
                  value={formData.stripePriceIdMonthly}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stripePriceIdMonthly: e.target.value,
                    })
                  }
                  placeholder="price_xxxxxxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripePriceIdYearly">Price ID Anual</Label>
                <Input
                  id="stripePriceIdYearly"
                  value={formData.stripePriceIdYearly}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stripePriceIdYearly: e.target.value,
                    })
                  }
                  placeholder="price_xxxxxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Configurações</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="position">Posição na Lista</Label>
                <Input
                  id="position"
                  type="number"
                  min="0"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      position: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Plano Ativo
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Plano em Destaque
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : plan
                ? 'Salvar Alterações'
                : 'Criar Plano'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
