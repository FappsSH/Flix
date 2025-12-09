'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ============================================================================
// HELPER: Verify Student
// ============================================================================

async function verifyStudent() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT' || !session.user.tenantId) {
    throw new Error('Acesso negado.')
  }

  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
  }
}

// ============================================================================
// GET FEATURED COURSE (for Hero Section)
// ============================================================================

export async function getFeaturedCourse() {
  try {
    const { tenantId } = await verifyStudent()

    const course = await prisma.course.findFirst({
      where: {
        tenantId,
        isPublished: true,
        isFeatured: true,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: course,
    }
  } catch (error) {
    console.error('Error fetching featured course:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar curso em destaque',
    }
  }
}

// ============================================================================
// GET COURSES BY CATEGORY
// ============================================================================

export async function getCoursesByCategory() {
  try {
    const { tenantId } = await verifyStudent()

    const categories = await prisma.category.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        courses: {
          where: {
            isPublished: true,
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 12,
        },
      },
      orderBy: {
        position: 'asc',
      },
    })

    // Filter out empty categories
    const categoriesWithCourses = categories.filter(
      (category) => category.courses.length > 0
    )

    return {
      success: true,
      data: categoriesWithCourses,
    }
  } catch (error) {
    console.error('Error fetching courses by category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar cursos',
    }
  }
}

// ============================================================================
// GET CONTINUE WATCHING
// ============================================================================

export async function getContinueWatching() {
  try {
    const { userId, tenantId } = await verifyStudent()

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        isActive: true,
        progress: {
          gt: 0,
          lt: 100,
        },
        course: {
          tenantId,
          isPublished: true,
          deletedAt: null,
        },
      },
      include: {
        course: true,
      },
      orderBy: {
        enrolledAt: 'desc',
      },
      take: 12,
    })

    const courses = enrollments.map((enrollment) => ({
      ...enrollment.course,
      progress: enrollment.progress,
    }))

    return {
      success: true,
      data: courses,
    }
  } catch (error) {
    console.error('Error fetching continue watching:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar cursos em andamento',
    }
  }
}

// ============================================================================
// GET MY LIST (Favorites)
// ============================================================================

export async function getMyList() {
  try {
    const { userId, tenantId } = await verifyStudent()

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        course: {
          tenantId,
          isPublished: true,
          deletedAt: null,
        },
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const courses = favorites.map((fav) => fav.course)

    return {
      success: true,
      data: courses,
    }
  } catch (error) {
    console.error('Error fetching my list:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar minha lista',
    }
  }
}

// ============================================================================
// TOGGLE FAVORITE
// ============================================================================

export async function toggleFavorite(courseId: string) {
  try {
    const { userId, tenantId } = await verifyStudent()

    // Verify course belongs to tenant
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        tenantId,
      },
    })

    if (!course) {
      return {
        success: false,
        error: 'Curso não encontrado',
      }
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (existing) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      })
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId,
          courseId,
        },
      })
    }

    revalidatePath('/browse')
    revalidatePath('/my-list')

    return {
      success: true,
      isFavorite: !existing,
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao favoritar curso',
    }
  }
}

// ============================================================================
// GET FAVORITE IDS
// ============================================================================

export async function getFavoriteIds() {
  try {
    const { userId } = await verifyStudent()

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { courseId: true },
    })

    return {
      success: true,
      data: favorites.map((f) => f.courseId),
    }
  } catch (error) {
    console.error('Error fetching favorite IDs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar favoritos',
      data: [],
    }
  }
}
