import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../lib/AuthProvider'
import Loading from '../Loading'
import {
  TaskAlt,
  WarningAmber,
  CheckCircle,
  Clock,
  TrendingUp,
} from '@mui/icons-material'

/**
 * StudentProgress - Shows student's progress on a course
 * Displays: completed assignments, quizzes, scores, overdue work, pending work, completion %
 * Parents: CourseDetails
 */
export default function StudentProgress({ courseId, studentId = null }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgress() {
      if (!courseId || !user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          course_id: courseId,
        })
        if (studentId) params.append('student_id', studentId)

        const res = await fetch(`/api/progress?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load progress')

        const data = await res.json()
        setProgress(data)
      } catch (err) {
        console.error('Error loading progress:', err)
        setError(err.message || 'Failed to load progress')
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [courseId, studentId, user?.id])

  if (loading) {
    return (
      <Loading message="Loading progress…">
        <div className="space-y-3">
          <div className="h-20 bg-surface-alt rounded-lg animate-pulse" />
          <div className="h-20 bg-surface-alt rounded-lg animate-pulse" />
        </div>
      </Loading>
    )
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg border border-token p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (!progress) {
    return null
  }

  const totalWork = progress.total_assignments + progress.total_quizzes
  const completedWork = progress.completed_assignments + progress.completed_quizzes

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <div className="rounded-lg border border-token bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-main">Course Progress</h3>
          <div className="flex items-center gap-2 text-main font-semibold">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {progress.course_completion_percentage}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">
              {completedWork} of {totalWork} completed
            </span>
          </div>
          <div className="h-3 bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{
                width: `${progress.course_completion_percentage}%`,
              }}
            />
          </div>
        </div>

        {/* Last Activity */}
        {progress.last_activity && (
          <p className="text-xs text-muted">
            Last activity: {new Date(progress.last_activity).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Assignments */}
        <div className="rounded-lg border border-token bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-main text-sm">Assignments</h4>
          </div>
          <div className="text-3xl font-bold text-main">
            {progress.completed_assignments}
            <span className="text-sm text-muted ml-2">/ {progress.total_assignments}</span>
          </div>
          <p className="text-xs text-muted mt-1">Completed</p>
        </div>

        {/* Completed Quizzes */}
        <div className="rounded-lg border border-token bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TaskAlt className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-main text-sm">Quizzes</h4>
          </div>
          <div className="text-3xl font-bold text-main">
            {progress.completed_quizzes}
            <span className="text-sm text-muted ml-2">/ {progress.total_quizzes}</span>
          </div>
          <p className="text-xs text-muted mt-1">Completed</p>
        </div>

        {/* Pending Work */}
        <div className="rounded-lg border border-token bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold text-main text-sm">Pending</h4>
          </div>
          <div className="text-3xl font-bold text-main">{progress.pending_assignments}</div>
          <p className="text-xs text-muted mt-1">Not submitted</p>
        </div>

        {/* Overdue Work */}
        <div className="rounded-lg border border-token bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <WarningAmber className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-main text-sm">Overdue</h4>
          </div>
          <div className="text-3xl font-bold text-red-500">{progress.overdue_assignments}</div>
          <p className="text-xs text-muted mt-1">Late submissions</p>
        </div>
      </div>

      {/* Detailed Breakdown Sections */}
      {progress.assignment_scores.length > 0 && (
        <div className="rounded-lg border border-token bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-bold text-main mb-4">Assignment Details</h3>
          <div className="space-y-3">
            {progress.assignment_scores.map(assignment => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-surface-alt rounded-lg border border-token"
              >
                <div className="flex-1">
                  <p className="font-medium text-main text-sm">{assignment.title}</p>
                  <p className="text-xs text-muted mt-1">
                    Status:{' '}
                    <span className={`font-semibold ${getStatusColor(assignment.status)}`}>
                      {formatStatus(assignment.status)}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  {assignment.score !== null ? (
                    <p className="font-bold text-main">{assignment.score}%</p>
                  ) : (
                    <p className="text-xs text-muted">No score</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.quiz_scores.length > 0 && (
        <div className="rounded-lg border border-token bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-bold text-main mb-4">Quiz Details</h3>
          <div className="space-y-3">
            {progress.quiz_scores.map(quiz => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-3 bg-surface-alt rounded-lg border border-token"
              >
                <div className="flex-1">
                  <p className="font-medium text-main text-sm">{quiz.title}</p>
                  <p className="text-xs text-muted mt-1">
                    Status:{' '}
                    <span className={`font-semibold ${getStatusColor(quiz.status)}`}>
                      {formatStatus(quiz.status)}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  {quiz.score !== null ? (
                    <p className="font-bold text-main">{quiz.score}%</p>
                  ) : (
                    <p className="text-xs text-muted">No score</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatStatus(status) {
  const statusMap = {
    graded: 'Graded',
    submitted: 'Submitted',
    late: 'Late',
    not_started: 'Not Started',
    assigned: 'Assigned',
  }
  return statusMap[status] || status
}

function getStatusColor(status) {
  switch (status) {
    case 'graded':
      return 'text-green-600 dark:text-green-400'
    case 'submitted':
      return 'text-blue-600 dark:text-blue-400'
    case 'late':
      return 'text-amber-600 dark:text-amber-400'
    case 'not_started':
      return 'text-gray-600 dark:text-gray-400'
    default:
      return 'text-muted'
  }
}
