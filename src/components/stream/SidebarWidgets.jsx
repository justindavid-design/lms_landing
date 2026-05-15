import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Activity, Bookmark, Users, FileText, BarChart3, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

/**
 * SidebarWidget - Reusable sidebar widget wrapper
 */
function SidebarWidget({ title, children, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

/**
 * UpcomingTasksWidget - Display upcoming assignments and quizzes
 */
export function UpcomingTasksWidget({ items = [] }) {
  if (items.length === 0) {
    return (
      <SidebarWidget title="Upcoming" icon={Calendar}>
        <p className="text-xs text-slate-500 text-center py-4">No upcoming items</p>
      </SidebarWidget>
    )
  }

  return (
    <SidebarWidget title="Upcoming" icon={Calendar}>
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => {
          const daysUntil = Math.ceil(
            (new Date(item.due_at) - new Date()) / (1000 * 60 * 60 * 24)
          )
          const isOverdue = daysUntil < 0
          const isDueSoon = daysUntil <= 2 && daysUntil >= 0

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              className={`px-3 py-2 rounded-lg border transition-all ${
                isOverdue
                  ? 'bg-red-50 border-red-200'
                  : isDueSoon
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                {item.title}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-600">
                  {item.type === 'quiz' ? 'Quiz' : 'Assignment'}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isOverdue
                      ? 'text-red-600'
                      : isDueSoon
                      ? 'text-amber-600'
                      : 'text-slate-600'
                  }`}
                >
                  {isOverdue
                    ? 'Overdue'
                    : daysUntil === 0
                    ? 'Today'
                    : daysUntil === 1
                    ? 'Tomorrow'
                    : `${daysUntil}d left`}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </SidebarWidget>
  )
}

/**
 * CourseProgressWidget - Show course completion progress
 */
export function CourseProgressWidget({ course }) {
  const completion = course?.completion_percent || 0
  const modules = course?.module_count || 0
  const assignments = course?.assignment_count || 0
  const quizzes = course?.quiz_count || 0

  return (
    <SidebarWidget title="Progress" icon={TrendingUp}>
      <div className="space-y-4">
        {/* Completion bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Overall Completion</span>
            <span className="text-sm font-bold text-blue-600">{completion}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Modules', value: modules },
            { label: 'Assignments', value: assignments },
            { label: 'Quizzes', value: quizzes },
          ].map((stat) => (
            <div key={stat.label} className="px-2 py-2 rounded-lg bg-slate-50 text-center border border-slate-200">
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SidebarWidget>
  )
}

/**
 * RecentActivityWidget - Show recent course activity
 */
export function RecentActivityWidget({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <SidebarWidget title="Recent Activity" icon={Activity}>
        <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>
      </SidebarWidget>
    )
  }

  const activityIcons = {
    announcement: Bell,
    assignment: FileText,
    quiz: BarChart3,
    submission: Activity,
  }

  return (
    <SidebarWidget title="Recent Activity" icon={Activity}>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {activities.slice(0, 8).map((activity, idx) => {
          const Icon = activityIcons[activity.type] || Activity
          const colors = {
            announcement: 'from-orange-400 to-red-500',
            assignment: 'from-blue-400 to-blue-600',
            quiz: 'from-purple-400 to-purple-600',
            submission: 'from-green-400 to-emerald-600',
          }

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3"
            >
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                  colors[activity.type] || 'from-slate-400 to-slate-500'
                } flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 line-clamp-1">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </SidebarWidget>
  )
}

/**
 * QuickLinksWidget - Navigation shortcuts
 */
export function QuickLinksWidget({ courseId, onNavigate }) {
  const links = [
    { icon: Users, label: 'People', action: 'people' },
    { icon: BarChart3, label: 'Grades', action: 'grades' },
    { icon: Bookmark, label: 'Resources', action: 'resources' },
  ]

  return (
    <SidebarWidget title="Quick Links" icon={Bookmark}>
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <motion.button
              key={link.action}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate?.(link.action)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all font-medium text-sm"
            >
              <Icon className="w-4 h-4" />
              {link.label}
              <span className="ml-auto text-slate-400">→</span>
            </motion.button>
          )
        })}
      </div>
    </SidebarWidget>
  )
}

/**
 * ClassStatsWidget - Show class-wide statistics
 */
export function ClassStatsWidget({ course, isTeacher }) {
  if (!isTeacher) return null

  const stats = [
    {
      label: 'Students',
      value: course?.enrolled_count || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Avg. Score',
      value: `${course?.avg_score || 0}%`,
      icon: BarChart3,
      color: 'text-green-600',
    },
  ]

  return (
    <SidebarWidget title="Class Stats" icon={BarChart3}>
      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600">{stat.label}</p>
                <p className="text-sm font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </SidebarWidget>
  )
}

export default SidebarWidget
