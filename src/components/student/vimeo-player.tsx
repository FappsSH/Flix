'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipForward } from 'lucide-react'
import { updateProgress } from '@/actions/student/progress'

interface VimeoPlayerProps {
  vimeoId: string
  lessonId: string
  onVideoEnd?: () => void
  onProgress?: (progress: number) => void
  hasNextLesson?: boolean
}

export function VimeoPlayer({
  vimeoId,
  lessonId,
  onVideoEnd,
  onProgress,
  hasNextLesson,
}: VimeoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const progressIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load Vimeo Player API
    const script = document.createElement('script')
    script.src = 'https://player.vimeo.com/api/player.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      if (iframeRef.current && window.Vimeo) {
        const player = new window.Vimeo.Player(iframeRef.current)

        // Get duration
        player.getDuration().then((dur: number) => {
          setDuration(dur)
        })

        // Listen to play/pause
        player.on('play', () => {
          setIsPlaying(true)
          hideControlsAfterDelay()
        })

        player.on('pause', () => {
          setIsPlaying(false)
          setShowControls(true)
        })

        // Listen to time updates
        player.on('timeupdate', (data: any) => {
          setCurrentTime(data.seconds)
          const progress = (data.seconds / data.duration) * 100
          onProgress?.(progress)
        })

        // Listen to ended
        player.on('ended', () => {
          setIsPlaying(false)
          if (hasNextLesson) {
            setShowNextEpisode(true)
          }
          onVideoEnd?.()
        })

        // Track progress every 10 seconds
        progressIntervalRef.current = setInterval(() => {
          player.getCurrentTime().then((time: number) => {
            player.getDuration().then((dur: number) => {
              const progress = Math.round((time / dur) * 100)
              updateProgress(lessonId, {
                watchedTime: Math.floor(time),
                progress,
                isCompleted: progress >= 90,
              })
            })
          })
        }, 10000)
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      document.body.removeChild(script)
    }
  }, [vimeoId, lessonId, hasNextLesson])

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (isPlaying) {
      hideControlsAfterDelay()
    }
  }

  const togglePlay = () => {
    if (iframeRef.current && window.Vimeo) {
      const player = new window.Vimeo.Player(iframeRef.current)
      if (isPlaying) {
        player.pause()
      } else {
        player.play()
      }
    }
  }

  const toggleMute = () => {
    if (iframeRef.current && window.Vimeo) {
      const player = new window.Vimeo.Player(iframeRef.current)
      player.setVolume(isMuted ? 1 : 0)
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (!isFullscreen) {
        if (iframeRef.current.requestFullscreen) {
          iframeRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Vimeo Iframe */}
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0&controls=0`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />

      {/* Custom Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
              >
                <svg className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-full bg-primary hover:bg-primary-hover transition-colors pointer-events-auto"
              >
                <Play className="w-12 h-12 text-white fill-white ml-1" />
              </motion.button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4 pointer-events-auto">
              {/* Progress Bar */}
              <div className="relative h-1 bg-text-muted/30 rounded-full overflow-hidden group/progress cursor-pointer hover:h-2 transition-all">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white fill-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white fill-white" />
                    )}
                  </button>

                  {/* Volume */}
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-6 h-6 text-white" />
                    ) : (
                      <Volume2 className="w-6 h-6 text-white" />
                    )}
                  </button>

                  {/* Time */}
                  <span className="text-sm text-white font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Settings */}
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Settings className="w-6 h-6 text-white" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Maximize className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Episode Overlay */}
      <AnimatePresence>
        {showNextEpisode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-text mb-2">
                  Próxima Aula
                </h3>
                <p className="text-text-secondary">
                  Começando automaticamente em alguns segundos...
                </p>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onVideoEnd}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-md transition-colors"
              >
                <SkipForward className="w-6 h-6" />
                Próxima Aula
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
