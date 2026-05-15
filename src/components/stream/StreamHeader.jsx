import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Clock, BarChart3, Share2, Settings } from 'lucide-react'

/**
 * StreamHeader - Modern course banner with hero section
 * Displays course title, instructor, code, and key statistics
 */
export default function StreamHeader({ course, isTeacher, onCustomize, onShare }) {
  const [shareOpen, setShareOpen] = useState(false)
  
  if (!course) return null

  const stats = [
    {
      icon: Users,
      label: 'Students',
      value: course.enrolled_count || 0,
    },
    {
      icon: BookOpen,
      label: 'Modules',
      value: course.module_count || 0,
    },
    {
      icon: Clock,
      label: 'Due Soon',
      value: course.due_soon_count || 0,
    },
    {
      icon: BarChart3,
      label: 'Completed',
      value: `${course.completion_percent || 0}%`,
    },
  ]

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      // Default share behavior
      setShareOpen(true)
    }
  }

  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-8 overflow-hidden rounded-2xl shadow-lg"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-grid-pattern" />

      {/* Action Buttons - Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-sm backdrop-blur-sm border border-white/30 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCustomize}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-sm backdrop-blur-sm border border-white/30 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Customize
        </motion.button>
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          {/* Left side - Title and code */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                {course.title}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4"
            >
              {course.course_code && (
                <div className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                  <span className="text-xs font-semibold text-white/90 tracking-wider">
                    Code: {course.course_code}
                  </span>
                </div>
              )}
              {course.author_name && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {course.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-white/90 font-medium">
                    {isTeacher ? 'You' : course.author_name}
                  </span>
                </div>
              )}
            </motion.div>

            {course.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-lg text-white/80 max-w-2xl"
              >
                {course.description}
              </motion.p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/70 font-semibold">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  )
}
