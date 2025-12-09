'use server'

import { getServerSession } from 'next/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
// GET ALL PLANS
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
