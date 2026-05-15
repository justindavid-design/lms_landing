import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InboxIcon, BookOpen, CheckSquare, Megaphone } from 'lucide-react'
import StreamHeader from './StreamHeader'
import QuickActionBar from './QuickActionBar'
import { AnnouncementCard, AssignmentCard, QuizCard, ModuleCard } from './StreamCards'
import {
  UpcomingTasksWidget,
  CourseProgressWidget,
  RecentActivityWidget,
  QuickLinksWidget,
  ClassStatsWidget,
} from './SidebarWidgets'

/**
 * EmptyStateCard - Display when stream is empty
 */
function EmptyStateCard({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50 p-12 text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-full bg-slate-200">
          <Icon className="w-8 h-8 text-slate-600" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

/**
 * StreamFeed - Main content feed
 */
function StreamFeed({
  course,
  isTeacher,
  announcements = [],
  modules = [],
  assignments = [],
  quizzes = [],
  userSubmissions = {},
  userAttempts = {},
  onAddAnnouncement,
  onAddAssignment,
  onAddQuiz,
  onAddModule,
  onEditItem,
  onDeleteItem,
  onSubmitAssignment,
  onViewSubmissions,
  onStartQuiz,
  onNavigateModule,
  loading,
}) {
  // Build unified feed
  const feedItems = []

  announcements.forEach((item) => {
    feedItems.push({
      id: `ann-${item.id}`,
      type: 'announcement',
      timestamp: item.created_at,
      data: item,
    })
  })

  modules.forEach((item) => {
    feedItems.push({
      id: `mod-${item.id}`,
      type: 'module',
      timestamp: item.created_at,
      data: item,
    })
  })

  assignments.forEach((item) => {
    feedItems.push({
      id: `asg-${item.id}`,
      type: 'assignment',
      timestamp: item.created_at,
      data: item,
    })
  })

  quizzes.forEach((item) => {
    feedItems.push({
      id: `quiz-${item.id}`,
      type: 'quiz',
      timestamp: item.created_at,
      data: item,
    })
  })

  // Sort by newest first
  feedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Show empty state if no content
  if (feedItems.length === 0 && !loading) {
    return (
      <div className="space-y-4">
        <EmptyStateCard
          icon={InboxIcon}
          title="Class stream is empty"
          description={
            isTeacher
              ? 'Get started by creating your first announcement or assigning work to your students.'
              : 'No announcements or assignments yet. Check back soon!'
          }
          actionLabel={isTeacher ? 'Create Announcement' : undefined}
          onAction={isTeacher ? onAddAnnouncement : undefined}
        />

        {isTeacher && (
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <EmptyStateCard
              icon={Megaphone}
              title="Share Updates"
              description="Post announcements to keep everyone informed"
              actionLabel="Post Now"
              onAction={onAddAnnouncement}
            />
            <EmptyStateCard
              icon={CheckSquare}
              title="Assign Work"
              description="Create assignments for your students"
              actionLabel="Create Assignment"
              onAction={onAddAssignment}
            />
            <EmptyStateCard
              icon={BookOpen}
              title="Organize Content"
              description="Organize materials into modules"
              actionLabel="Create Module"
              onAction={onAddModule}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {feedItems.map((item) => {
          const { id, type, data } = item

          if (type === 'announcement') {
            return (
              <AnnouncementCard
                key={id}
                announcement={data}
                isTeacher={isTeacher}
                onDelete={() => onDeleteItem('announcement', data)}
              />
            )
          }

          if (type === 'assignment') {
            return (
              <AssignmentCard
                key={id}
                assignment={data}
                isTeacher={isTeacher}
                userSubmission={userSubmissions[data.id]}
                onEdit={() => onEditItem('assignment', data)}
                onDelete={() => onDeleteItem('assignment', data)}
                onSubmit={() => onSubmitAssignment(data)}
                onViewSubmissions={() => onViewSubmissions?.(data)}
              />
            )
          }

          if (type === 'quiz') {
            return (
              <QuizCard
                key={id}
                quiz={data}
                isTeacher={isTeacher}
                userAttempt={userAttempts[data.id]}
                onStart={() => onStartQuiz(data)}
                onEdit={() => onEditItem('quiz', data)}
                onDelete={() => onDeleteItem('quiz', data)}
              />
            )
          }

          if (type === 'module') {
            return (
              <ModuleCard
                key={id}
                module={data}
                isTeacher={isTeacher}
                itemCount={data.item_count}
                onEdit={() => onEditItem('module', data)}
                onDelete={() => onDeleteItem('module', data)}
                onClick={() => onNavigateModule(data)}
              />
            )
          }

          return null
        })}
      </AnimatePresence>
    </div>
  )
}

/**
 * StreamContainer - Main stream component
 */
export default function StreamContainer({
  course,
  isTeacher,
  announcements = [],
  modules = [],
  assignments = [],
  quizzes = [],
  userSubmissions = {},
  userAttempts = {},
  onAddAnnouncement,
  onAddAssignment,
  onAddQuiz,
  onAddModule,
  onEditItem,
  onDeleteItem,
  onSubmitAssignment,
  onViewSubmissions,
  onStartQuiz,
  onNavigate,
  onCustomize,
  onShare,
  loading = false,
}) {
  // Calculate upcoming items
  const upcomingItems = [...assignments, ...quizzes]
    .filter((item) => item.due_at && new Date(item.due_at) > new Date())
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))

  // Build activity feed
  const activities = [
    ...announcements.map((item) => ({
      type: 'announcement',
      title: item.title,
      timestamp: item.created_at,
    })),
    ...assignments.map((item) => ({
      type: 'assignment',
      title: item.title,
      timestamp: item.created_at,
    })),
    ...quizzes.map((item) => ({
      type: 'quiz',
      title: item.title,
      timestamp: item.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <StreamHeader course={course} isTeacher={isTeacher} onCustomize={onCustomize} onShare={onShare} />

      {/* Quick Actions */}
      <QuickActionBar
        onAddAnnouncement={onAddAnnouncement}
        onAddAssignment={onAddAssignment}
        onAddQuiz={onAddQuiz}
        onAddModule={onAddModule}
        isTeacher={isTeacher}
      />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <StreamFeed
            course={course}
            isTeacher={isTeacher}
            announcements={announcements}
            modules={modules}
            assignments={assignments}
            quizzes={quizzes}
            userSubmissions={userSubmissions}
            userAttempts={userAttempts}
            onAddAnnouncement={onAddAnnouncement}
            onAddAssignment={onAddAssignment}
            onAddQuiz={onAddQuiz}
            onAddModule={onAddModule}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onSubmitAssignment={onSubmitAssignment}
            onViewSubmissions={onViewSubmissions}
            onStartQuiz={onStartQuiz}
            onNavigateModule={(module) => onNavigate?.('module', module)}
            loading={loading}
          />
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-4">
          {/* Upcoming Tasks */}
          <UpcomingTasksWidget items={upcomingItems} />

          {/* Progress */}
          <CourseProgressWidget course={course} />

          {/* Class Stats (Teachers Only) */}
          {isTeacher && <ClassStatsWidget course={course} isTeacher={isTeacher} />}

          {/* Recent Activity */}
          <RecentActivityWidget activities={activities} />

          {/* Quick Links */}
          <QuickLinksWidget courseId={course?.id} onNavigate={onNavigate} />
        </div>
      </div>
    </motion.div>
  )
}
