'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createTenantSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  slug: z.string().optional(),
  subdomain: z.string().optional(),
  domain: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  fontFamily: z.string().default('Inter'),
  planId: z.string().min(1, 'Plano é obrigatório'),
  interval: z.enum(['MONTHLY', 'YEARLY']),
})

const updateTenantSchema = z.object({
  name: z.string().min(3).optional(),
  slug: z.string().optional(),
  subdomain: z.string().optional(),
  domain: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ============================================================================
// HELPER: Verify Super Admin
// ============================================================================

async function verifySuperAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Acesso negado. Apenas Super Admin pode executar esta ação.')
  }

  return session
}

// ============================================================================
// CREATE TENANT
// ============================================================================

export async function createTenant(data: z.infer<typeof createTenantSchema>) {
  try {
    // Verify permissions
    await verifySuperAdmin()

    // Validate input
    const validated = createTenantSchema.parse(data)

    // Generate slug if not provided
    const slug = validated.slug || generateSlug(validated.name)

    // Check if slug already exists
    const existingSlug = await prisma.tenant.findUnique({
      where: { slug },
    })

    if (existingSlug) {
      return {
        success: false,
        error: 'Slug já está em uso. Escolha outro nome.',
      }
    }

    // Check if subdomain already exists
    if (validated.subdomain) {
      const existingSubdomain = await prisma.tenant.findUnique({
        where: { subdomain: validated.subdomain },
      })

      if (existingSubdomain) {
        return {
          success: false,
          error: 'Subdomínio já está em uso.',
        }
      }
    }

    // Get plan
    const plan = await prisma.plan.findUnique({
      where: { id: validated.planId },
    })

    if (!plan) {
      return {
        success: false,
        error: 'Plano não encontrado.',
      }
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: validated.name,
        slug,
        subdomain: validated.subdomain,
        domain: validated.domain,
        primaryColor: validated.primaryColor,
        secondaryColor: validated.secondaryColor,
        fontFamily: validated.fontFamily,
        isActive: true,
      },
    })

    // Create subscription
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: 'TRIALING', // Começa em trial
        interval: validated.interval,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias de trial
        trialStart: new Date(),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    })

    revalidatePath('/super-admin/tenants')

    return {
      success: true,
      data: tenant,
    }
  } catch (error) {
    console.error('Error creating tenant:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar tenant',
    }
  }
}

// ============================================================================
// GET ALL TENANTS
// ============================================================================

export async function getTenants() {
  try {
    await verifySuperAdmin()

    const tenants = await prisma.tenant.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'TRIALING', 'PAST_DUE'],
            },
          },
          include: {
            plan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            users: {
              where: {
                role: 'STUDENT',
                deletedAt: null,
              },
            },
            courses: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: tenants,
    }
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar tenants',
    }
  }
}

// ============================================================================
// GET TENANT BY ID
// ============================================================================

export async function getTenantById(id: string) {
  try {
    await verifySuperAdmin()

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            users: {
              where: {
                role: 'STUDENT',
                deletedAt: null,
              },
            },
            courses: {
              where: {
                deletedAt: null,
              },
            },
            certificates: true,
          },
        },
      },
    })

    if (!tenant) {
      return {
        success: false,
        error: 'Tenant não encontrado.',
      }
    }

    return {
      success: true,
      data: tenant,
    }
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar tenant',
    }
  }
}

// ============================================================================
// UPDATE TENANT
// ============================================================================

export async function updateTenant(
  id: string,
  data: z.infer<typeof updateTenantSchema>
) {
  try {
    await verifySuperAdmin()

    const validated = updateTenantSchema.parse(data)

    // Check if tenant exists
    const existing = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Tenant não encontrado.',
      }
    }

    // Check slug uniqueness if changing
    if (validated.slug && validated.slug !== existing.slug) {
      const existingSlug = await prisma.tenant.findUnique({
        where: { slug: validated.slug },
      })

      if (existingSlug) {
        return {
          success: false,
          error: 'Slug já está em uso.',
        }
      }
    }

    // Check subdomain uniqueness if changing
    if (validated.subdomain && validated.subdomain !== existing.subdomain) {
      const existingSubdomain = await prisma.tenant.findUnique({
        where: { subdomain: validated.subdomain },
      })

      if (existingSubdomain) {
        return {
          success: false,
          error: 'Subdomínio já está em uso.',
        }
      }
    }

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id },
      data: validated,
    })

    revalidatePath('/super-admin/tenants')
    revalidatePath(`/super-admin/tenants/${id}`)

    return {
      success: true,
      data: tenant,
    }
  } catch (error) {
    console.error('Error updating tenant:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar tenant',
    }
  }
}

// ============================================================================
// DELETE TENANT (Soft delete)
// ============================================================================

export async function deleteTenant(id: string) {
  try {
    await verifySuperAdmin()

    // Check if tenant exists
    const existing = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Tenant não encontrado.',
      }
    }

    // Soft delete (marca como deletado ao invés de remover do banco)
    await prisma.tenant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    revalidatePath('/super-admin/tenants')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar tenant',
    }
  }
}

// ============================================================================
// TOGGLE TENANT ACTIVE STATUS
// ============================================================================

export async function toggleTenantStatus(id: string) {
  try {
    await verifySuperAdmin()

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!tenant) {
      return {
        success: false,
        error: 'Tenant não encontrado.',
      }
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        isActive: !tenant.isActive,
      },
    })

    revalidatePath('/super-admin/tenants')
    revalidatePath(`/super-admin/tenants/${id}`)

    return {
      success: true,
      data: updated,
    }
  } catch (error) {
    console.error('Error toggling tenant status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao alterar status',
    }
  }
}
