'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CourseCard } from './course-card'

interface Course {
  id: string
  title: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  duration?: number | null
  isFeatured?: boolean
}

interface CourseRowProps {
  title: string
  courses: Course[]
  favorites?: string[]
  onToggleFavorite?: (courseId: string) => void
}

export function CourseRow({
  title,
  courses,
  favorites = [],
  onToggleFavorite,
}: CourseRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)

  const handleScroll = (direction: 'left' | 'right') => {
    if (isScrolling || !rowRef.current) return

    setIsScrolling(true)

    const scrollAmount = rowRef.current.clientWidth * 0.8
    const targetScroll =
      direction === 'left'
        ? rowRef.current.scrollLeft - scrollAmount
        : rowRef.current.scrollLeft + scrollAmount

    rowRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })

    setTimeout(() => {
      setIsScrolling(false)
      updateArrowsVisibility()
    }, 600)
  }

  const updateArrowsVisibility = () => {
    if (!rowRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  if (!courses || courses.length === 0) {
    return null
  }

  return (
    <div className="relative group/row">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-xl md:text-2xl font-bold text-text mb-4 px-4 md:px-12"
      >
        {title}
      </motion.h2>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-0 bottom-0 z-40 flex items-center justify-center w-12 md:w-16 bg-gradient-to-r from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-background-card/80 backdrop-blur-sm border border-secondary hover:border-primary transition-colors">
                <ChevronLeft className="h-6 w-6 text-text" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right Arrow */}
        <AnimatePresence>
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-0 bottom-0 z-40 flex items-center justify-center w-12 md:w-16 bg-gradient-to-l from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-background-card/80 backdrop-blur-sm border border-secondary hover:border-primary transition-colors">
                <ChevronRight className="h-6 w-6 text-text" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Cards Container */}
        <div
          ref={rowRef}
          onScroll={updateArrowsVisibility}
          className="flex gap-2 md:gap-4 overflow-x-auto overflow-y-visible scroll-smooth hide-scrollbar px-4 md:px-12 py-8"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="flex-none w-[calc(50%-4px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-12px)] xl:w-[calc(16.666%-13px)]"
            >
              <CourseCard
                course={course}
                index={index}
                isFavorite={favorites.includes(course.id)}
                onToggleFavorite={() => onToggleFavorite?.(course.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
