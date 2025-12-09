'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// VALIDATION
// ============================================================================

const commentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio').max(1000, 'Comentário muito longo'),
  lessonId: z.string(),
  parentId: z.string().optional(),
})

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
// CREATE COMMENT
// ============================================================================

export async function createComment(data: z.infer<typeof commentSchema>) {
  try {
    const { userId, tenantId } = await verifyStudent()

    // Validate
    const validated = commentSchema.parse(data)

    // Verify lesson belongs to tenant
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: validated.lessonId,
        module: {
          course: {
            tenantId,
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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId,
        lessonId: validated.lessonId,
        content: validated.content,
        parentId: validated.parentId,
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
    })

    // Award XP for commenting (small reward)
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: 5,
        },
      },
    })

    revalidatePath(`/watch/${validated.lessonId}`)

    return {
      success: true,
      data: comment,
    }
  } catch (error) {
    console.error('Error creating comment:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar comentário',
    }
  }
}

// ============================================================================
// DELETE COMMENT
// ============================================================================

export async function deleteComment(commentId: string) {
  try {
    const { userId } = await verifyStudent()

    // Verify comment belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return {
        success: false,
        error: 'Comentário não encontrado',
      }
    }

    if (comment.userId !== userId) {
      return {
        success: false,
        error: 'Você não pode deletar este comentário',
      }
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    })

    revalidatePath(`/watch/${comment.lessonId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar comentário',
    }
  }
}
