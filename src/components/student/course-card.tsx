'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Plus, Check, ChevronDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  course: {
    id: string
    title: string
    slug: string
    description?: string | null
    thumbnail?: string | null
    duration?: number | null
    isFeatured?: boolean
  }
  index?: number
  isFavorite?: boolean
  progress?: number
  onToggleFavorite?: () => void
}

export function CourseCard({
  course,
  index = 0,
  isFavorite = false,
  progress = 0,
  onToggleFavorite,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Card Container */}
      <motion.div
        className="relative rounded-md overflow-hidden bg-background-card cursor-pointer"
        whileHover={{
          scale: 1.05,
          zIndex: 50,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={`/course/${course.slug}`}>
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-secondary">
            {course.thumbnail ? (
              <>
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className={cn(
                    'object-cover transition-all duration-500',
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
                    isHovered && 'scale-110'
                  )}
                  onLoad={() => setImageLoaded(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-secondary animate-pulse" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                <Play className="h-12 w-12 text-text-muted" />
              </div>
            )}

            {/* Gradient Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Progress Bar */}
            {progress > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </div>
        </Link>

        {/* Hover Content */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-background via-background/80 to-transparent"
            >
              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-bold text-text mb-2 line-clamp-2"
              >
                {course.title}
              </motion.h3>

              {/* Description */}
              {course.description && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm text-text-secondary mb-3 line-clamp-2"
                >
                  {course.description}
                </motion.p>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2"
              >
                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-white hover:bg-white/90 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    // Navigate to watch page
                    window.location.href = `/course/${course.slug}`
                  }}
                >
                  <Play className="h-4 w-4 text-background fill-background ml-0.5" />
                </motion.button>

                {/* Add to List Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-text-secondary hover:border-text transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleFavorite?.()
                  }}
                >
                  {isFavorite ? (
                    <Check className="h-4 w-4 text-text" />
                  ) : (
                    <Plus className="h-4 w-4 text-text" />
                  )}
                </motion.button>

                {/* Info Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-text-secondary hover:border-text transition-colors ml-auto"
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = `/course/${course.slug}`
                  }}
                >
                  <ChevronDown className="h-4 w-4 text-text" />
                </motion.button>
              </motion.div>

              {/* Meta Info */}
              {course.duration && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-2 mt-3 text-xs text-text-muted"
                >
                  <span>{formatDuration(course.duration)}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Badge */}
        {course.isFeatured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-2 left-2 px-2 py-1 bg-primary rounded text-xs font-bold text-white z-10"
          >
            Destaque
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
