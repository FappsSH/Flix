'use server'

import { getServerSession } from 'next-auth'
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
// GET DASHBOARD METRICS
// ============================================================================

export async function getDashboardMetrics() {
  try {
    await verifySuperAdmin()

    // Total de tenants ativos
    const totalTenants = await prisma.tenant.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    })

    // Total de tenants em trial
    const tenantsInTrial = await prisma.subscription.count({
      where: {
        status: 'TRIALING',
      },
    })

    // Total de tenants com assinatura ativa
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
      },
    })

    // Total de tenants com pagamento atrasado
    const pastDueSubscriptions = await prisma.subscription.count({
      where: {
        status: 'PAST_DUE',
      },
    })

    // MRR (Monthly Recurring Revenue) - soma das assinaturas mensais ativas
    const subscriptionsData = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      include: {
        plan: true,
      },
    })

    let mrr = 0
    let arr = 0

    subscriptionsData.forEach((sub) => {
      if (sub.interval === 'MONTHLY') {
        mrr += Number(sub.plan.monthlyPrice)
      } else if (sub.interval === 'YEARLY') {
        // Converte anual para mensal
        mrr += Number(sub.plan.yearlyPrice) / 12
      }
    })

    // ARR (Annual Recurring Revenue)
    arr = mrr * 12

    // Total de alunos em todos os tenants
    const totalStudents = await prisma.user.count({
      where: {
        role: 'STUDENT',
        deletedAt: null,
      },
    })

    // Total de cursos em todos os tenants
    const totalCourses = await prisma.course.count({
      where: {
        deletedAt: null,
      },
    })

    // Novos tenants este mês
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const newTenantsThisMonth = await prisma.tenant.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        deletedAt: null,
      },
    })

    // Crescimento MRR (comparado com mês anterior)
    const startOfLastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    )
    const endOfLastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      0
    )

    const lastMonthSubscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      include: {
        plan: true,
      },
    })

    let lastMonthMrr = 0
    lastMonthSubscriptions.forEach((sub) => {
      if (sub.interval === 'MONTHLY') {
        lastMonthMrr += Number(sub.plan.monthlyPrice)
      } else if (sub.interval === 'YEARLY') {
        lastMonthMrr += Number(sub.plan.yearlyPrice) / 12
      }
    })

    const mrrGrowth = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : 0

    return {
      success: true,
      data: {
        totalTenants,
        tenantsInTrial,
        activeSubscriptions,
        pastDueSubscriptions,
        mrr,
        arr,
        mrrGrowth,
        totalStudents,
        totalCourses,
        newTenantsThisMonth,
      },
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar métricas',
    }
  }
}

// ============================================================================
// GET RECENT TENANTS
// ============================================================================

export async function getRecentTenants(limit: number = 5) {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return {
      success: true,
      data: tenants,
    }
  } catch (error) {
    console.error('Error fetching recent tenants:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar tenants recentes',
    }
  }
}

// ============================================================================
// GET REVENUE CHART DATA (Last 12 months)
// ============================================================================

export async function getRevenueChartData() {
  try {
    await verifySuperAdmin()

    const months = []
    const now = new Date()

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        mrr: 0,
      })
    }

    // Get all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      include: {
        plan: true,
      },
    })

    // Calculate MRR for each month
    months.forEach((monthData, index) => {
      subscriptions.forEach((sub) => {
        const subCreatedAt = new Date(sub.createdAt)
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1)

        // If subscription was created before or during this month
        if (subCreatedAt <= monthDate) {
          if (sub.interval === 'MONTHLY') {
            monthData.mrr += Number(sub.plan.monthlyPrice)
          } else if (sub.interval === 'YEARLY') {
            monthData.mrr += Number(sub.plan.yearlyPrice) / 12
          }
        }
      })
    })

    return {
      success: true,
      data: months,
    }
  } catch (error) {
    console.error('Error fetching revenue chart data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar dados de receita',
    }
  }
}
