import { prisma } from '@/lib/prisma'
import { SubscriptionStatus } from '@prisma/client'
import type { TenantWithLicense, TenantLicenseStatus } from '@/types/tenant'

// ============================================================================
// TENANT DETECTION & LICENSE VERIFICATION
// ============================================================================

/**
 * Detecta o tenant com base em:
 * 1. Domínio customizado (ex: cursos.academiaxyz.com)
 * 2. Subdomínio (ex: academia-xyz.plataforma.com)
 * 3. Path (ex: plataforma.com/academia-xyz)
 */
export async function detectTenant(
  hostname: string,
  pathname?: string
): Promise<TenantWithLicense | null> {
  // Remove www. e porta
  const cleanHostname = hostname.replace(/^www\./, '').split(':')[0]

  // Extrai subdomínio (primeira parte antes do primeiro ponto)
  const parts = cleanHostname.split('.')
  const subdomain = parts.length > 2 ? parts[0] : null

  // Extrai primeiro segmento do path (se fornecido)
  const pathTenant = pathname ? pathname.split('/')[1] : null

  try {
    // ESTRATÉGIA 1: Busca por domínio customizado
    let tenant = await prisma.tenant.findFirst({
      where: {
        domain: cleanHostname,
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
    })

    // ESTRATÉGIA 2: Busca por subdomínio
    if (
      !tenant &&
      subdomain &&
      subdomain !== 'www' &&
      subdomain !== 'localhost' &&
      subdomain !== 'super' // Reservado para Super Admin
    ) {
      tenant = await prisma.tenant.findFirst({
        where: {
          subdomain,
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
      })
    }

    // ESTRATÉGIA 3: Busca por path (fallback)
    if (!tenant && pathTenant) {
      tenant = await prisma.tenant.findFirst({
        where: {
          slug: pathTenant,
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
      })
    }

    return tenant as TenantWithLicense | null
  } catch (error) {
    console.error('Error detecting tenant:', error)
    return null
  }
}

// ============================================================================
// LICENSE VERIFICATION
// ============================================================================

/**
 * Verifica o status da licença do tenant
 */
export function verifyTenantLicense(
  tenant: TenantWithLicense
): TenantLicenseStatus {
  // Tenant inativo
  if (!tenant.isActive) {
    return {
      isValid: false,
      status: 'INACTIVE',
      reason: 'Tenant desativado pelo Super Admin',
    }
  }

  // Nenhuma assinatura ativa
  if (!tenant.subscriptions || tenant.subscriptions.length === 0) {
    return {
      isValid: false,
      status: 'NO_SUBSCRIPTION',
      reason: 'Nenhuma assinatura ativa encontrada',
    }
  }

  const subscription = tenant.subscriptions[0]

  // Verifica o status da assinatura
  switch (subscription.status) {
    case 'ACTIVE':
      return {
        isValid: true,
        status: 'ACTIVE',
        subscription,
        plan: subscription.plan,
      }

    case 'TRIALING':
      return {
        isValid: true,
        status: 'TRIALING',
        subscription,
        plan: subscription.plan,
        trialEndsAt: subscription.trialEnd || undefined,
      }

    case 'PAST_DUE':
      // Permite acesso, mas com aviso
      return {
        isValid: true,
        status: 'PAST_DUE',
        subscription,
        plan: subscription.plan,
        warning: 'Pagamento em atraso. Regularize para evitar suspensão.',
      }

    case 'CANCELED':
      return {
        isValid: false,
        status: 'CANCELED',
        reason: 'Assinatura cancelada',
        canceledAt: subscription.canceledAt || undefined,
      }

    case 'INCOMPLETE':
      return {
        isValid: false,
        status: 'INCOMPLETE',
        reason: 'Pagamento não finalizado',
      }

    default:
      return {
        isValid: false,
        status: 'UNKNOWN',
        reason: 'Status da assinatura desconhecido',
      }
  }
}

// ============================================================================
// TENANT LIMITS VERIFICATION
// ============================================================================

/**
 * Verifica se o tenant está dentro dos limites do plano
 */
export async function checkTenantLimits(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      subscriptions: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          plan: true,
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
  })

  if (!tenant || tenant.subscriptions.length === 0) {
    return {
      withinLimits: false,
      reason: 'Nenhuma assinatura ativa',
    }
  }

  const plan = tenant.subscriptions[0].plan
  const currentStudents = tenant._count.users
  const currentCourses = tenant._count.courses

  const limits = {
    students: {
      current: currentStudents,
      max: plan.maxStudents,
      exceeded: plan.maxStudents ? currentStudents >= plan.maxStudents : false,
    },
    courses: {
      current: currentCourses,
      max: plan.maxCourses,
      exceeded: plan.maxCourses ? currentCourses >= plan.maxCourses : false,
    },
    storage: {
      current: 0, // TODO: Implementar cálculo de storage
      max: plan.maxStorage,
      exceeded: false,
    },
  }

  return {
    withinLimits:
      !limits.students.exceeded &&
      !limits.courses.exceeded &&
      !limits.storage.exceeded,
    limits,
    plan,
  }
}

// ============================================================================
// TENANT CACHE (Opcional - para performance)
// ============================================================================

// Cache simples em memória (em produção, usar Redis)
const tenantCache = new Map<string, { tenant: TenantWithLicense; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Busca tenant com cache
 */
export async function getTenantCached(
  hostname: string,
  pathname?: string
): Promise<TenantWithLicense | null> {
  const cacheKey = `${hostname}:${pathname || ''}`

  // Verifica cache
  const cached = tenantCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tenant
  }

  // Busca no banco
  const tenant = await detectTenant(hostname, pathname)

  // Salva no cache
  if (tenant) {
    tenantCache.set(cacheKey, {
      tenant,
      expiresAt: Date.now() + CACHE_TTL,
    })
  }

  return tenant
}

/**
 * Limpa cache do tenant (útil ao atualizar configurações)
 */
export function clearTenantCache(hostname?: string) {
  if (hostname) {
    // Remove apenas o tenant específico
    for (const key of tenantCache.keys()) {
      if (key.startsWith(hostname)) {
        tenantCache.delete(key)
      }
    }
  } else {
    // Limpa todo o cache
    tenantCache.clear()
  }
}

// ============================================================================
// TENANT BY ID (para uso interno)
// ============================================================================

/**
 * Busca tenant por ID com validação de licença
 */
export async function getTenantById(
  tenantId: string
): Promise<TenantWithLicense | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantId,
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
    })

    return tenant as TenantWithLicense | null
  } catch (error) {
    console.error('Error fetching tenant by ID:', error)
    return null
  }
}
