import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Megaphone, ClipboardList, CheckSquare, BookOpen } from 'lucide-react'

/**
 * QuickActionBar - Sticky action buttons for creating course content
 * Features: Modern design, hover animations, responsive layout
 */
export default function QuickActionBar({ onAddAnnouncement, onAddAssignment, onAddQuiz, onAddModule, isTeacher }) {
  const actions = [
    {
      id: 'announcement',
      icon: Megaphone,
      label: 'Announcement',
      color: 'from-orange-400 to-red-500',
      hoverColor: 'hover:shadow-orange-500/20',
      onClick: onAddAnnouncement,
      disabled: !isTeacher,
    },
    {
      id: 'assignment',
      icon: ClipboardList,
      label: 'Assignment',
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:shadow-blue-500/20',
      onClick: onAddAssignment,
      disabled: !isTeacher,
    },
    {
      id: 'quiz',
      icon: CheckSquare,
      label: 'Quiz',
      color: 'from-purple-400 to-purple-600',
      hoverColor: 'hover:shadow-purple-500/20',
      onClick: onAddQuiz,
      disabled: !isTeacher,
    },
    {
      id: 'module',
      icon: BookOpen,
      label: 'Module',
      color: 'from-emerald-400 to-emerald-600',
      hoverColor: 'hover:shadow-emerald-500/20',
      onClick: onAddModule,
      disabled: !isTeacher,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8 sticky top-0 z-30 bg-gradient-to-b from-white via-white to-white/80 backdrop-blur-xl pt-4 pb-6 rounded-2xl shadow-md border border-slate-100"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900 px-3 mb-4">Quick Actions</h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 px-1">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.id}
              variants={buttonVariants}
              whileHover={!action.disabled ? { scale: 1.08, y: -2 } : {}}
              whileTap={!action.disabled ? { scale: 0.95 } : {}}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                relative px-4 py-3 rounded-xl font-semibold text-sm
                flex items-center gap-2 transition-all duration-300
                ${action.disabled 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                  : `bg-gradient-to-br ${action.color} text-white shadow-lg ${action.hoverColor} hover:shadow-2xl`
                }
              `}
              title={action.disabled ? 'Teachers only' : `Add ${action.label}`}
            >
              {/* Animated background glow on hover */}
              {!action.disabled && (
                <motion.div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${action.color} opacity-0`}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Icon with animation */}
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              {/* Label */}
              <span className="relative z-10 whitespace-nowrap">{action.label}</span>

              {/* Plus icon on hover */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileHover={!action.disabled ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <Plus className="w-4 h-4" />
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      {!isTeacher && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 px-3 text-xs text-slate-500 italic"
        >
          Only instructors can create content
        </motion.p>
      )}
    </motion.div>
  )
}
