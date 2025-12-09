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
// GET LESSON WITH COURSE DATA
// ============================================================================

export async function getLessonForWatch(lessonId: string) {
  try {
    const { userId, tenantId } = await verifyStudent()

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isPublished: true,
        deletedAt: null,
        module: {
          course: {
            tenantId,
            isPublished: true,
            deletedAt: null,
          },
        },
      },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  where: {
                    isPublished: true,
                    deletedAt: null,
                  },
                  include: {
                    lessons: {
                      where: {
                        isPublished: true,
                        deletedAt: null,
                      },
                      orderBy: {
                        position: 'asc',
                      },
                    },
                  },
                  orderBy: {
                    position: 'asc',
                  },
                },
              },
            },
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        progress: {
          where: {
            userId,
          },
        },
        comments: {
          where: {
            parentId: null,
            deletedAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              where: {
                deletedAt: null,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!lesson) {
      return {
        success: false,
        error: 'Aula não encontrada',
      }
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.course.id,
        },
      },
    })

    if (!enrollment) {
      return {
        success: false,
        error: 'Você não está matriculado neste curso',
      }
    }

    return {
      success: true,
      data: {
        lesson,
        enrollment,
      },
    }
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar aula',
    }
  }
}

// ============================================================================
// GET NEXT LESSON
// ============================================================================

export async function getNextLesson(currentLessonId: string) {
  try {
    const { userId, tenantId } = await verifyStudent()

    // Get current lesson
    const currentLesson = await prisma.lesson.findFirst({
      where: {
        id: currentLessonId,
        module: {
          course: {
            tenantId,
          },
        },
      },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  where: {
                    isPublished: true,
                    deletedAt: null,
                  },
                  include: {
                    lessons: {
                      where: {
                        isPublished: true,
                        deletedAt: null,
                      },
                      orderBy: {
                        position: 'asc',
                      },
                    },
                  },
                  orderBy: {
                    position: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!currentLesson) {
      return { success: false, error: 'Aula não encontrada' }
    }

    // Find next lesson in same module
    const currentModule = currentLesson.module
    const nextLessonInModule = currentModule.lessons.find(
      (lesson) => lesson.position > currentLesson.position
    )

    if (nextLessonInModule) {
      return {
        success: true,
        data: {
          id: nextLessonInModule.id,
          title: nextLessonInModule.title,
          moduleTitle: currentModule.title,
        },
      }
    }

    // Find next module
    const course = currentLesson.module.course
    const nextModule = course.modules.find(
      (module) => module.position > currentModule.position
    )

    if (nextModule && nextModule.lessons.length > 0) {
      const firstLesson = nextModule.lessons[0]
      return {
        success: true,
        data: {
          id: firstLesson.id,
          title: firstLesson.title,
          moduleTitle: nextModule.title,
        },
      }
    }

    // No next lesson
    return {
      success: true,
      data: null,
    }
  } catch (error) {
    console.error('Error getting next lesson:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar próxima aula',
    }
  }
}

// ============================================================================
// UPDATE PROGRESS
// ============================================================================

export async function updateProgress(
  lessonId: string,
  data: {
    watchedTime: number
    progress: number
    isCompleted?: boolean
  }
) {
  try {
    const { userId, tenantId } = await verifyStudent()

    // Verify lesson belongs to tenant
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            tenantId,
          },
        },
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      return {
        success: false,
        error: 'Aula não encontrada',
      }
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.course.id,
        },
      },
    })

    if (!enrollment) {
      return {
        success: false,
        error: 'Você não está matriculado neste curso',
      }
    }

    // Get or create progress
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    })

    const isCompleted = data.isCompleted || data.progress >= 90
    const wasNotCompleted = !existingProgress?.isCompleted

    // Update or create progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        watchedTime: data.watchedTime,
        progress: data.progress,
        isCompleted,
        completedAt: isCompleted && wasNotCompleted ? new Date() : existingProgress?.completedAt,
      },
      create: {
        userId,
        lessonId,
        watchedTime: data.watchedTime,
        progress: data.progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    // If lesson just completed, award XP
    if (isCompleted && wasNotCompleted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: lesson.xpReward,
          },
        },
      })

      // Calculate new level (simple: 1 level per 100 XP)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true },
      })

      if (user) {
        const newLevel = Math.floor(user.xp / 100) + 1
        await prisma.user.update({
          where: { id: userId },
          data: { level: newLevel },
        })
      }

      // Update course progress
      await updateCourseProgress(userId, lesson.module.course.id)
    }

    revalidatePath(`/watch/${lessonId}`)
    revalidatePath('/browse')

    return {
      success: true,
      data: {
        progress,
        xpAwarded: isCompleted && wasNotCompleted ? lesson.xpReward : 0,
      },
    }
  } catch (error) {
    console.error('Error updating progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar progresso',
    }
  }
}

// ============================================================================
// UPDATE COURSE PROGRESS
// ============================================================================

async function updateCourseProgress(userId: string, courseId: string) {
  // Get all lessons in course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        where: {
          isPublished: true,
          deletedAt: null,
        },
        include: {
          lessons: {
            where: {
              isPublished: true,
              deletedAt: null,
            },
          },
        },
      },
    },
  })

  if (!course) return

  // Count total lessons
  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  )

  if (totalLessons === 0) return

  // Count completed lessons
  const completedLessons = await prisma.progress.count({
    where: {
      userId,
      isCompleted: true,
      lesson: {
        module: {
          courseId,
        },
      },
    },
  })

  // Calculate progress percentage
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  // Update enrollment
  await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      progress: progressPercentage,
      completedAt: progressPercentage === 100 ? new Date() : null,
    },
  })

  // If course completed, generate certificate
  if (progressPercentage === 100) {
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!existingCertificate) {
      // Get tenant
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        include: {
          course: {
            select: {
              tenantId: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      })

      if (enrollment) {
        // Generate unique certificate code
        const code = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        await prisma.certificate.create({
          data: {
            userId,
            courseId,
            tenantId: enrollment.course.tenantId,
            code,
            status: 'ISSUED',
            issuedAt: new Date(),
          },
        })
      }
    }
  }
}

// ============================================================================
// MARK LESSON AS COMPLETED
// ============================================================================

export async function markLessonCompleted(lessonId: string) {
  return updateProgress(lessonId, {
    watchedTime: 0,
    progress: 100,
    isCompleted: true,
  })
}
