import { PrismaClient } from '@prisma/client'

// ============================================================================
// PRISMA CLIENT SINGLETON
// ============================================================================
// Evita múltiplas instâncias do Prisma Client em desenvolvimento (hot reload)

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// ============================================================================
// HELPER: Verificar conexão com o banco
// ============================================================================

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true }
  } catch (error) {
    console.error('Database connection error:', error)
    return { connected: false, error }
  }
}

// ============================================================================
// HELPER: Desconectar do banco (útil em scripts)
// ============================================================================

export async function disconnectDatabase() {
  await prisma.$disconnect()
}
