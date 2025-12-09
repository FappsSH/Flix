'use client'

import { useState } from 'react'
import { CourseRow } from './course-row'
import { toggleFavorite } from '@/actions/student/courses'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  duration?: number | null
  isFeatured?: boolean
}

interface CourseRowClientProps {
  title: string
  courses: Course[]
  favorites: string[]
}

export function CourseRowClient({ title, courses, favorites: initialFavorites }: CourseRowClientProps) {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>(initialFavorites)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleFavorite = async (courseId: string) => {
    if (isToggling) return

    // Optimistic update
    setFavorites((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    )

    setIsToggling(true)
    const result = await toggleFavorite(courseId)
    setIsToggling(false)

    if (!result.success) {
      // Revert on error
      setFavorites(initialFavorites)
      alert(result.error || 'Erro ao favoritar curso')
    } else {
      // Refresh to update server data
      router.refresh()
    }
  }

  return (
    <CourseRow
      title={title}
      courses={courses}
      favorites={favorites}
      onToggleFavorite={handleToggleFavorite}
    />
  )
}
