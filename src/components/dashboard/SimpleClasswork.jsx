import React, { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/apiClient'
import { useAuth } from '../../lib/AuthProvider'

export default function SimpleClasswork({ courseId, isTeacher }) {
  const { userId } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (courseId && userId) {
      loadContent()
    }
  }, [courseId, userId])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const [assignmentsRes, quizzesRes] = await Promise.all([
        apiFetch(`/api/courses/${courseId}/assignments?user_id=${encodeURIComponent(userId)}`),
        apiFetch(`/api/courses/${courseId}/quizzes?user_id=${encodeURIComponent(userId)}`)
      ])
      
      const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : []
      const quizzesData = quizzesRes.ok ? await quizzesRes.json() : []
      
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
    } catch (error) {
      console.error('Failed to load classwork:', error)
      setError('Failed to load classwork. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDueStatus = (dueDate) => {
    if (!dueDate) return { label: 'No due date', color: 'text-slate-500' }
    const due = new Date(dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return { label: 'Overdue', color: 'text-red-600' }
    if (daysUntilDue === 0) return { label: 'Due today', color: 'text-amber-600' }
    if (daysUntilDue <= 3) return { label: `Due in ${daysUntilDue} days`, color: 'text-amber-600' }
    return { label: formatDate(dueDate), color: 'text-slate-600' }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading classwork...</div>
  }

  if (error) {
    return <div className="text-center py-12 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>
  }

  const allContent = [...assignments, ...quizzes].sort((a, b) => {
    const dateA = new Date(a.due_at || 0)
    const dateB = new Date(b.due_at || 0)
    return dateA - dateB
  })

  if (allContent.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <p className="text-slate-600">No assignments or quizzes yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {allContent.map((item) => {
        const isQuiz = quizzes.some(q => q.id === item.id)
        const status = getDueStatus(item.due_at)

        return (
          <div
            key={item.id}
            className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${isQuiz ? 'bg-purple-600' : 'bg-green-600'}`}></span>
                  <h3 className="font-semibold text-slate-900 truncate text-lg">{item.title || item.name}</h3>
                </div>
                {item.instructions && (
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">{item.instructions}</p>
                )}
                <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
              </div>
              <span className="ml-3 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
                {isQuiz ? 'Quiz' : 'Assignment'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
