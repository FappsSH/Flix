'use client'

import { useState } from 'react'
import { Tenant } from '@prisma/client'
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
import { X } from 'lucide-react'
import { updateTenant } from '@/actions/super-admin/tenants'
import { FONT_FAMILIES } from '@/constants'

interface TenantEditModalProps {
  tenant: Tenant
  onClose: () => void
  onSuccess: () => void
}

export function TenantEditModal({
  tenant,
  onClose,
  onSuccess,
}: TenantEditModalProps) {
  const [formData, setFormData] = useState({
    name: tenant.name,
    subdomain: tenant.subdomain || '',
    domain: tenant.domain || '',
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    fontFamily: tenant.fontFamily,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = await updateTenant(tenant.id, {
      ...formData,
      subdomain: formData.subdomain || undefined,
      domain: formData.domain || undefined,
    })

    setIsSubmitting(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Erro ao atualizar tenant')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Editar Tenant</h2>
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Tenant</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nome da Empresa"
              required
            />
          </div>

          {/* Subdomain */}
          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomínio</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) =>
                  setFormData({ ...formData, subdomain: e.target.value })
                }
                placeholder="empresa"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                .seudominio.com
              </span>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domínio Customizado (opcional)</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) =>
                setFormData({ ...formData, domain: e.target.value })
              }
              placeholder="cursos.empresa.com"
            />
          </div>

          {/* Colors */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  placeholder="#E50914"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryColor: e.target.value,
                    })
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryColor: e.target.value,
                    })
                  }
                  placeholder="#B20710"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Fonte</Label>
            <Select
              value={formData.fontFamily}
              onValueChange={(value) =>
                setFormData({ ...formData, fontFamily: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="p-6 rounded-lg border-2"
              style={{
                backgroundColor: formData.primaryColor + '15',
                borderColor: formData.primaryColor,
                fontFamily: formData.fontFamily,
              }}
            >
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: formData.primaryColor }}
              >
                {formData.name}
              </h3>
              <p style={{ color: formData.secondaryColor }}>
                Esta é uma prévia do tema escolhido
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
