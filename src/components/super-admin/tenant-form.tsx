'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTenant } from '@/actions/super-admin/tenants'
import { generateSlug } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { PRESET_THEMES } from '@/lib/theme'

interface Plan {
  id: string
  name: string
  description: string | null
  monthlyPrice: number
  yearlyPrice: number
}

interface TenantFormProps {
  plans: Plan[]
  initialData?: any
}

export function TenantForm({ plans, initialData }: TenantFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    subdomain: initialData?.subdomain || '',
    domain: initialData?.domain || '',
    primaryColor: initialData?.primaryColor || PRESET_THEMES.netflix.primaryColor,
    secondaryColor: initialData?.secondaryColor || PRESET_THEMES.netflix.secondaryColor,
    fontFamily: initialData?.fontFamily || 'Inter',
    planId: '',
    interval: 'MONTHLY' as 'MONTHLY' | 'YEARLY',
  })

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value),
      subdomain: prev.subdomain || generateSlug(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createTenant(formData)

    if (result.success) {
      router.push('/super-admin/tenants')
      router.refresh()
    } else {
      setError(result.error || 'Erro ao criar tenant')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Informações Básicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Tenant *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Academia XYZ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="academia-xyz"
              required
            />
            <p className="text-xs text-text-muted">URL amigável para o tenant</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomínio</Label>
            <Input
              id="subdomain"
              value={formData.subdomain}
              onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
              placeholder="academia-xyz"
            />
            <p className="text-xs text-text-muted">
              Será: {formData.subdomain || 'subdomain'}.plataforma.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domínio Customizado</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="cursos.academiaxyz.com"
            />
            <p className="text-xs text-text-muted">Opcional</p>
          </div>
        </div>
      </div>

      {/* Customization */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Personalização</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Cor Primária *</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#E50914"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Cor Secundária *</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                placeholder="#2F2F2F"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">Fonte</Label>
            <Select
              value={formData.fontFamily}
              onValueChange={(value) => setFormData(prev => ({ ...prev, fontFamily: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg border border-secondary">
          <p className="text-sm font-medium text-text mb-3">Preview das cores:</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <div
                className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Cor Primária
              </div>
            </div>
            <div className="flex-1">
              <div
                className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                Cor Secundária
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Plano de Assinatura</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planId">Plano *</Label>
            <Select
              value={formData.planId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, planId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - R$ {plan.monthlyPrice.toString()}/mês
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Intervalo de Cobrança *</Label>
            <Select
              value={formData.interval}
              onValueChange={(value: 'MONTHLY' | 'YEARLY') => setFormData(prev => ({ ...prev, interval: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="YEARLY">Anual (2 meses grátis)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan Details */}
          {formData.planId && (
            <div className="p-4 rounded-lg bg-secondary/50">
              {plans.find(p => p.id === formData.planId) && (() => {
                const plan = plans.find(p => p.id === formData.planId)!
                const price = formData.interval === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice
                return (
                  <div>
                    <p className="font-medium text-text mb-2">{plan.name}</p>
                    {plan.description && (
                      <p className="text-sm text-text-secondary mb-3">{plan.description}</p>
                    )}
                    <p className="text-2xl font-bold text-primary">
                      R$ {price.toString()}
                      <span className="text-sm font-normal text-text-secondary">
                        /{formData.interval === 'MONTHLY' ? 'mês' : 'ano'}
                      </span>
                    </p>
                    <p className="text-sm text-text-muted mt-2">
                      14 dias de trial gratuito
                    </p>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-secondary">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !formData.planId}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar Tenant
        </Button>
      </div>
    </form>
  )
}
