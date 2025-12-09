'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, Volume2, VolumeX } from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  description?: string | null
  heroImage?: string | null
  heroVideo?: string | null
  thumbnail?: string | null
  duration?: number | null
  _count?: {
    modules: number
    enrollments: number
  }
}

interface HeroSectionProps {
  course: Course
}

export function HeroSection({ course }: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    // Auto-play video after image loads (Netflix behavior)
    if (imageLoaded && course.heroVideo) {
      const timer = setTimeout(() => {
        setShowVideo(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [imageLoaded, course.heroVideo])

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {showVideo && course.heroVideo ? (
            <motion.video
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            >
              <source src={course.heroVideo} type="video/mp4" />
            </motion.video>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? 1 : 1.1,
              }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {(course.heroImage || course.thumbnail) && (
                <Image
                  src={course.heroImage || course.thumbnail || ''}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover"
                  onLoad={() => setImageLoaded(true)}
                  sizes="100vw"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container-netflix">
          <div className="max-w-2xl space-y-6">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text drop-shadow-lg"
            >
              {course.title}
            </motion.h1>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 text-sm md:text-base"
            >
              {course.duration && (
                <span className="text-text font-semibold">
                  {formatDuration(course.duration)}
                </span>
              )}
              {course._count?.modules && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-secondary">
                    {course._count.modules} módulos
                  </span>
                </>
              )}
              {course._count?.enrollments && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-secondary">
                    {course._count.enrollments} alunos
                  </span>
                </>
              )}
            </motion.div>

            {/* Description */}
            {course.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-base md:text-lg text-text-secondary line-clamp-3 drop-shadow-md"
              >
                {course.description}
              </motion.p>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center gap-4"
            >
              {/* Play Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={`/course/${course.slug}`}
                  className="inline-flex items-center gap-3 px-8 py-3 bg-white hover:bg-white/90 text-background font-bold text-lg rounded-md transition-colors shadow-lg"
                >
                  <Play className="h-6 w-6 fill-background" />
                  Assistir
                </Link>
              </motion.div>

              {/* More Info Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={`/course/${course.slug}`}
                  className="inline-flex items-center gap-3 px-8 py-3 bg-text-muted/30 hover:bg-text-muted/40 text-text font-bold text-lg rounded-md transition-colors backdrop-blur-sm"
                >
                  <Info className="h-6 w-6" />
                  Mais Informações
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mute Button */}
      {showVideo && course.heroVideo && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-32 right-8 md:bottom-40 md:right-12 z-20 flex items-center justify-center h-12 w-12 rounded-full border-2 border-text-secondary hover:border-text bg-background/50 backdrop-blur-sm transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-text" />
          ) : (
            <Volume2 className="h-5 w-5 text-text" />
          )}
        </motion.button>
      )}

      {/* Age Rating Badge (opcional) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-32 left-8 md:bottom-40 md:left-12 px-3 py-1 border-2 border-text-muted text-text-muted text-sm font-bold rounded"
      >
        L
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-6 h-10 border-2 border-text-muted rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-text-muted rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}
