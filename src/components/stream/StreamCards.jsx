import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, AlertCircle, Edit2, Trash2, MessageCircle, Heart, Share2, Pin, MoreVertical, Clipboard, PenTool, BookOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

/**
 * Base StreamCard wrapper component
 */
function StreamCard({ children, isHoverable = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={isHoverable ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div
        className={`relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-300 ${
          isHoverable ? 'hover:shadow-lg hover:border-slate-300' : ''
        }`}
      >
        {/* Animated top border accent */}
        <motion.div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full" />
        {children}
      </div>
    </motion.div>
  )
}

/**
 * AnnouncementCard - Display announcements with rich content
 */
export function AnnouncementCard({ announcement, isTeacher, onEdit, onDelete, onPin }) {
  const [showMenu, setShowMenu] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(announcement.likes_count || 0)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <StreamCard>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-sm font-bold text-white">A</span>
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-lg line-clamp-2">{announcement.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-medium text-slate-600">Announcement</span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 w-40"
                >
                  {isTeacher && (
                    <>
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit(announcement)
                            setShowMenu(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onPin?.(announcement)
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Pin className="w-4 h-4" />
                        Pin
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          onDelete?.(announcement)
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4 text-slate-700 line-clamp-3 text-sm leading-relaxed">
          {announcement.body}
        </div>

        {/* Engagement */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                liked
                  ? 'bg-red-50 text-red-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{likeCount}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium">{announcement.comment_count || 0}</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </StreamCard>
  )
}

/**
 * AssignmentCard - Display assignments with due date and submission status
 */
export function AssignmentCard({ assignment, isTeacher, userSubmission, onEdit, onDelete, onSubmit, onViewSubmissions }) {
  const dueDate = new Date(assignment.due_at)
  const isOverdue = dueDate < new Date() && !userSubmission?.submitted_at
  const isSubmitted = !!userSubmission?.submitted_at

  return (
    <StreamCard>
      <div
        className={`p-6 ${isTeacher ? 'cursor-pointer' : ''}`}
        onClick={isTeacher ? () => onViewSubmissions?.(assignment) : undefined}
        role={isTeacher ? 'button' : undefined}
        tabIndex={isTeacher ? 0 : undefined}
        onKeyDown={isTeacher ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onViewSubmissions?.(assignment)
          }
        } : undefined}
        aria-label={isTeacher ? `View submissions for ${assignment.title}` : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Clipboard className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-lg line-clamp-2">{assignment.title}</h3>
                {isSubmitted && (
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold whitespace-nowrap">
                    Submitted
                  </span>
                )}
                {isOverdue && (
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
                    <AlertCircle className="w-3 h-3" />
                    Overdue
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Calendar className="w-4 h-4" />
                  Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                </div>
                {assignment.points && (
                  <span className="text-xs font-semibold text-slate-700">• {assignment.points} pts</span>
                )}
              </div>
            </div>
          </div>

          {isTeacher ? null : null}
        </div>

        {/* Description */}
        {assignment.instructions && (
          <p className="mb-4 text-slate-700 text-sm line-clamp-2">{assignment.instructions}</p>
        )}

        {/* Action */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
          {!isTeacher && !isSubmitted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSubmit?.(assignment)}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
            >
              Submit Work
            </motion.button>
          )}
          {isTeacher && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit?.(assignment)
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete?.(assignment)
                }}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
              >
                Delete
              </motion.button>
            </>
          )}
        </div>
      </div>
    </StreamCard>
  )
}

/**
 * QuizCard - Interactive quiz card with engaging design
 */
export function QuizCard({ quiz, isTeacher, userAttempt, onStart, onEdit, onDelete }) {
  const dueDate = quiz.due_at ? new Date(quiz.due_at) : null
  const isOverdue = dueDate && dueDate < new Date() && !userAttempt?.completed_at
  const isCompleted = !!userAttempt?.completed_at
  const attempts_left = Math.max(0, (quiz.attempts_allowed || 1) - (userAttempt?.attempt_number || 0))

  return (
    <StreamCard>
      <div className="p-6">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 pl-3">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <PenTool className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-lg line-clamp-2">{quiz.title}</h3>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {quiz.question_count && (
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <span className="font-semibold">{quiz.question_count}</span> questions
                  </span>
                )}
                {dueDate && (
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isCompleted && (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold whitespace-nowrap">
              Completed
            </span>
          )}
        </div>

        {/* Description */}
        {quiz.description && (
          <p className="mb-4 text-slate-700 text-sm line-clamp-2 pl-3">{quiz.description}</p>
        )}

        {/* Stats */}
        {!isTeacher && (
          <div className="mb-4 pl-3 grid grid-cols-2 gap-3">
            {attempts_left > 0 && (
              <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold">{attempts_left} Attempts Left</p>
              </div>
            )}
            {userAttempt?.score !== undefined && (
              <div className="px-3 py-2 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold">Score: {userAttempt.score}%</p>
              </div>
            )}
          </div>
        )}

        {/* Action */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 pl-3">
          {!isTeacher && !isCompleted && attempts_left > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStart?.(quiz)}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              Start Quiz
            </motion.button>
          )}
          {!isTeacher && isCompleted && attempts_left > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStart?.(quiz)}
              className="flex-1 px-4 py-3 rounded-lg border border-purple-300 text-purple-700 font-semibold text-sm hover:bg-purple-50 transition-colors"
            >
              Retake Quiz
            </motion.button>
          )}
          {isTeacher && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit?.(quiz)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete?.(quiz)}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
              >
                Delete
              </motion.button>
            </>
          )}
        </div>
      </div>
    </StreamCard>
  )
}

/**
 * ModuleCard - Display course modules/lessons
 */
export function ModuleCard({ module, isTeacher, itemCount, onEdit, onDelete, onClick }) {
  return (
    <StreamCard isHoverable={true}>
      <motion.div
        onClick={onClick}
        className="p-6 cursor-pointer"
        whileHover={{ backgroundColor: '#f9fafb' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-lg line-clamp-2">{module.title}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-medium text-slate-600">Module</span>
                {itemCount !== undefined && (
                  <span className="text-xs text-slate-500">• {itemCount} items</span>
                )}
              </div>
            </div>
          </div>

          {isTeacher && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </motion.button>
          )}
        </div>

        {/* Description */}
        {module.description && (
          <p className="mt-3 text-slate-700 text-sm line-clamp-2">{module.description}</p>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            Created {formatDistanceToNow(new Date(module.created_at), { addSuffix: true })}
          </span>
          {isTeacher && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit?.(module)
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete?.(module)
                }}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
          <motion.span
            whileHover={{ x: 4 }}
            className={`${isTeacher ? 'hidden' : 'flex'} text-xs font-semibold text-blue-600 items-center gap-1`}
          >
            View module →
          </motion.span>
        </div>
      </motion.div>
    </StreamCard>
  )
}

export default StreamCard
