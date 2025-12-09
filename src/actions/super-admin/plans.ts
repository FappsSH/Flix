'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const planSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, 'Preço mensal deve ser maior ou igual a 0'),
  yearlyPrice: z.number().min(0, 'Preço anual deve ser maior ou igual a 0'),
  maxStudents: z.number().min(1, 'Máximo de alunos deve ser no mínimo 1'),
  maxCourses: z.number().min(1, 'Máximo de cursos deve ser no mínimo 1'),
  maxStorage: z.number().min(1, 'Máximo de armazenamento deve ser no mínimo 1'),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  position: z.number().default(0),
  stripePriceIdMonthly: z.string().optional(),
  stripePriceIdYearly: z.string().optional(),
})

// ============================================================================
// HELPER: Verify Super Admin
// ============================================================================

async function verifySuperAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Acesso negado.')
  }

  return session
}

// ============================================================================
// GET ALL PLANS (including inactive)
// ============================================================================

export async function getAllPlans() {
  try {
    await verifySuperAdmin()

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: {
                  in: ['ACTIVE', 'TRIALING', 'PAST_DUE'],
                },
              },
            },
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    })

    return {
      success: true,
      data: plans,
    }
  } catch (error) {
    console.error('Error fetching plans:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar planos',
    }
  }
}

// ============================================================================
// GET ACTIVE PLANS ONLY
// ============================================================================

export async function getPlans() {
  try {
    await verifySuperAdmin()

    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        position: 'asc',
      },
    })

    return {
      success: true,
      data: plans,
    }
  } catch (error) {
    console.error('Error fetching plans:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar planos',
    }
  }
}

// ============================================================================
// GET PLAN BY ID
// ============================================================================

export async function getPlanById(id: string) {
  try {
    await verifySuperAdmin()

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    })

    if (!plan) {
      return {
        success: false,
        error: 'Plano não encontrado.',
      }
    }

    return {
      success: true,
      data: plan,
    }
  } catch (error) {
    console.error('Error fetching plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar plano',
    }
  }
}

// ============================================================================
// CREATE PLAN
// ============================================================================

export async function createPlan(data: z.infer<typeof planSchema>) {
  try {
    await verifySuperAdmin()

    const validated = planSchema.parse(data)

    // Check if slug already exists
    const existingSlug = await prisma.plan.findUnique({
      where: { slug: validated.slug },
    })

    if (existingSlug) {
      return {
        success: false,
        error: 'Slug já está em uso.',
      }
    }

    const plan = await prisma.plan.create({
      data: validated,
    })

    revalidatePath('/super-admin/plans')

    return {
      success: true,
      data: plan,
    }
  } catch (error) {
    console.error('Error creating plan:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar plano',
    }
  }
}

// ============================================================================
// UPDATE PLAN
// ============================================================================

export async function updatePlan(
  id: string,
  data: Partial<z.infer<typeof planSchema>>
) {
  try {
    await verifySuperAdmin()

    const existing = await prisma.plan.findUnique({
      where: { id },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Plano não encontrado.',
      }
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.plan.findUnique({
        where: { slug: data.slug },
      })

      if (existingSlug) {
        return {
          success: false,
          error: 'Slug já está em uso.',
        }
      }
    }

    const plan = await prisma.plan.update({
      where: { id },
      data,
    })

    revalidatePath('/super-admin/plans')
    revalidatePath(`/super-admin/plans/${id}`)

    return {
      success: true,
      data: plan,
    }
  } catch (error) {
    console.error('Error updating plan:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar plano',
    }
  }
}

// ============================================================================
// TOGGLE PLAN ACTIVE STATUS
// ============================================================================

export async function togglePlanStatus(id: string) {
  try {
    await verifySuperAdmin()

    const plan = await prisma.plan.findUnique({
      where: { id },
    })

    if (!plan) {
      return {
        success: false,
        error: 'Plano não encontrado.',
      }
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        isActive: !plan.isActive,
      },
    })

    revalidatePath('/super-admin/plans')

    return {
      success: true,
      data: updated,
    }
  } catch (error) {
    console.error('Error toggling plan status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao alterar status',
    }
  }
}

// ============================================================================
// DELETE PLAN
// ============================================================================

export async function deletePlan(id: string) {
  try {
    await verifySuperAdmin()

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    })

    if (!plan) {
      return {
        success: false,
        error: 'Plano não encontrado.',
      }
    }

    // Prevent deletion if plan has active subscriptions
    if (plan._count.subscriptions > 0) {
      return {
        success: false,
        error:
          'Não é possível deletar um plano com assinaturas ativas. Desative o plano ao invés disso.',
      }
    }

    await prisma.plan.delete({
      where: { id },
    })

    revalidatePath('/super-admin/plans')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar plano',
    }
  }
}
