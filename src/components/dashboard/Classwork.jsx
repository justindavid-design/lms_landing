import React, { useState, useMemo, useCallback } from 'react'
import { apiFetch } from '../../lib/apiClient'

export default function Classwork({ courseId, isTeacher, currentUserId }) {
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [selectedForGrading, setSelectedForGrading] = useState(null)

  React.useEffect(() => {
    loadContent()
  }, [courseId])

  const loadContent = async () => {
    try {
      setLoading(true)
      const [assignRes, quizRes] = await Promise.all([
        apiFetch(`/api/assignments?courseId=${courseId}`),
        apiFetch(`/api/quizzes?courseId=${courseId}`)
      ])

      setAssignments(assignRes || [])
      setQuizzes(quizRes || [])
      setError('')
    } catch (err) {
      setError('Failed to load classwork')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Combine and filter
  const allContent = useMemo(() => {
    const combined = [
      ...assignments.map(a => ({ ...a, type: 'assignment' })),
      ...quizzes.map(q => ({ ...q, type: 'quiz' }))
    ]

    // Filter by status
    let filtered = combined
    if (filterStatus !== 'all' && !isTeacher) {
      filtered = combined.filter(item => {
        const isDue = new Date(item.due_at || item.dueAt) > new Date()
        if (filterStatus === 'due' && !isDue) return false
        if (filterStatus === 'completed' && isDue) return false
        return true
      })
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.due_at || a.dueAt) - new Date(b.due_at || b.dueAt)
      }
      return 0
    })
  }, [assignments, quizzes, filterStatus, sortBy, isTeacher])

  // Get submission stats for teacher
  const getSubmissionStats = useCallback(async (itemId, type) => {
    try {
      const endpoint = type === 'assignment' ? `/api/submissions?assignmentId=${itemId}` : `/api/submissions?quizId=${itemId}`
      const subs = await apiFetch(endpoint)
      return {
        total: subs.length,
        submitted: subs.filter(s => s.submitted_at).length,
        graded: subs.filter(s => s.score !== null).length,
        late: subs.filter(s => s.submitted_at && new Date(s.submitted_at) > new Date(subs[0]?.assignment?.due_at)).length
      }
    } catch {
      return { total: 0, submitted: 0, graded: 0, late: 0 }
    }
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getDueStatus = (dueDate) => {
    if (!dueDate) return { label: 'No date', color: 'slate' }
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due - now
    const hours = diff / (1000 * 60 * 60)

    if (diff < 0) return { label: 'Overdue', color: 'red' }
    if (hours < 24) return { label: 'Due soon', color: 'amber' }
    if (hours < 72) return { label: 'Due in 3 days', color: 'blue' }
    return { label: 'Upcoming', color: 'slate' }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading classwork...</div>
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header with Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Classwork</h2>
          <span className="text-sm text-slate-600">{allContent.length} items</span>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap gap-3">
          {!isTeacher && (
            <>
              <select 
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:border-slate-300"
              >
                <option value="all">All work</option>
                <option value="due">Due soon</option>
                <option value="completed">Completed</option>
              </select>
            </>
          )}

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:border-slate-300"
          >
            <option value="dueDate">Sort by due date</option>
            <option value="title">Sort by title</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {allContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 font-medium">No classwork yet</p>
            <p className="text-sm text-slate-500 mt-1">Teachers will post assignments and quizzes here</p>
          </div>
        ) : (
          allContent.map(item => {
            const dueStatus = getDueStatus(item.due_at || item.dueAt)
            const statusColors = {
              slate: 'bg-slate-100 text-slate-700 border-slate-200',
              blue: 'bg-blue-100 text-blue-700 border-blue-200',
              amber: 'bg-amber-100 text-amber-700 border-amber-200',
              red: 'bg-red-100 text-red-700 border-red-200'
            }
            const colorClass = statusColors[dueStatus.color]

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="group border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
                onClick={() => isTeacher && item.type === 'assignment' && setSelectedForGrading(item)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                    backgroundColor: item.type === 'assignment' ? '#dce8ff' : '#fce8b6'
                  }}>
                    {item.type === 'assignment' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {item.type === 'assignment' ? 'Assignment' : 'Quiz'} • {formatDate(item.due_at || item.dueAt)}
                    </p>
                    {item.instructions && !isTeacher && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{item.instructions}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorClass}`}>
                      {dueStatus.label}
                    </span>

                    {isTeacher && (
                      <div className="text-xs text-slate-600 text-right">
                        <p className="font-medium">Submissions</p>
                        <p className="text-slate-500">Check responses →</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Show grading panel if selected */}
      {selectedForGrading && (
        <div className="mt-8 pt-8 border-t border-slate-200">
          <button
            onClick={() => setSelectedForGrading(null)}
            className="mb-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </button>
          {/* Grading panel will be inserted here by parent component */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">Grading panel for: {selectedForGrading.title}</p>
            <p className="text-sm text-blue-600 mt-1">Component ready to be wired to SubmissionsPanel</p>
          </div>
        </div>
      )}
    </div>
  )
}
