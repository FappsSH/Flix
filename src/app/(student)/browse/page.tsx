import {
  getFeaturedCourse,
  getCoursesByCategory,
  getContinueWatching,
  getMyList,
  getFavoriteIds,
} from '@/actions/student/courses'
import { HeroSection } from '@/components/student/hero-section'
import { CourseRow } from '@/components/student/course-row'
import { CourseRowClient } from '@/components/student/course-row-client'

export const metadata = {
  title: 'Início',
  description: 'Navegue por nossos cursos',
}

export default async function BrowsePage() {
  // Fetch all data in parallel
  const [featuredResult, categoriesResult, continueWatchingResult, myListResult, favoritesResult] =
    await Promise.all([
      getFeaturedCourse(),
      getCoursesByCategory(),
      getContinueWatching(),
      getMyList(),
      getFavoriteIds(),
    ])

  const featuredCourse = featuredResult.success ? featuredResult.data : null
  const categories = categoriesResult.success ? categoriesResult.data : []
  const continueWatching = continueWatchingResult.success ? continueWatchingResult.data : []
  const myList = myListResult.success ? myListResult.data : []
  const favorites = favoritesResult.success ? favoritesResult.data : []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {featuredCourse && <HeroSection course={featuredCourse} />}

      {/* Course Rows */}
      <div className="relative -mt-32 z-10 space-y-12 pb-20">
        {/* Continue Watching */}
        {continueWatching && continueWatching.length > 0 && (
          <CourseRowClient
            title="Continue Assistindo"
            courses={continueWatching}
            favorites={favorites || []}
          />
        )}

        {/* My List */}
        {myList && myList.length > 0 && (
          <CourseRowClient
            title="Minha Lista"
            courses={myList}
            favorites={favorites || []}
          />
        )}

        {/* Categories */}
        {categories.map((category) => (
          <CourseRowClient
            key={category.id}
            title={category.name}
            courses={category.courses}
            favorites={favorites || []}
          />
        ))}

        {/* Empty State */}
        {categories.length === 0 && continueWatching.length === 0 && myList.length === 0 && (
          <div className="container-netflix py-20 text-center">
            <h2 className="text-2xl font-bold text-text mb-4">
              Nenhum curso disponível
            </h2>
            <p className="text-text-secondary">
              Os cursos aparecerão aqui quando forem publicados.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
