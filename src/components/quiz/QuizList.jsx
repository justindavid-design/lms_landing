import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/apiClient'
import { getApiErrorMessage, safeJson } from '../courses/utils'
import { Plus, Edit, Copy, Trash2, Eye, EyeOff, ChevronDown } from 'lucide-react'
import ConfirmDialog from '../dashboard/ConfirmDialog'

function formatDate(dateString) {
  if (!dateString) return 'No due date'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

function QuizCard({ quiz, courseId, isTeacher, onRefresh }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null })

  const questionCount = quiz.questions ? Object.keys(quiz.questions).length : 0
  const totalPoints = quiz.questions
    ? Object.values(quiz.questions).reduce((sum, q) => sum + (q.points || 0), 0)
    : 0
  const isPublished = quiz.status === 'published'

  const handleEdit = () => {
    navigate(`/dashboard/course/${courseId}/quiz/${quiz.id}/edit`)
    setShowMenu(false)
  }

  const handleDuplicate = async () => {
    setIsLoading(true)
    try {
      const res = await apiFetch(`/api/quizzes/${quiz.id}/duplicate`, {
        method: 'POST',
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to duplicate quiz'))
      setShowMenu(false)
      onRefresh()
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishToggle = async () => {
    setIsLoading(true)
    try {
      const newStatus = isPublished ? 'draft' : 'published'
      const res = await apiFetch(`/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to update quiz'))
      setShowMenu(false)
      onRefresh()
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const res = await apiFetch(`/api/quizzes/${quiz.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await safeJson(res)
        throw new Error(getApiErrorMessage(data, 'Failed to delete quiz'))
      }
      setConfirmDialog({ isOpen: false, action: null })
      onRefresh()
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-sm text-slate-600 mt-1">{quiz.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
              <span>📋 {questionCount} questions</span>
              <span>⭐ {totalPoints} points</span>
              {quiz.due_at && <span>📅 {formatDate(quiz.due_at)}</span>}
              {quiz.attempts_allowed && (
                <span>🔄 {quiz.attempts_allowed} attempts</span>
              )}
            </div>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>

            {isTeacher && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-slate-100 rounded"
                  disabled={isLoading}
                >
                  <ChevronDown size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={handleDuplicate}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center gap-2 border-t border-slate-200"
                      disabled={isLoading}
                    >
                      <Copy size={16} /> Duplicate
                    </button>
                    <button
                      onClick={handlePublishToggle}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center gap-2 border-t border-slate-200"
                      disabled={isLoading}
                    >
                      {isPublished ? (
                        <>
                          <EyeOff size={16} /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye size={16} /> Publish
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDialog({ isOpen: true, action: 'delete' })
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2 border-t border-slate-200"
                      disabled={isLoading}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Quiz?"
        message={`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null })}
      />
    </>
  )
}

export default function QuizList({ courseId, quizzes = [], isTeacher = false, onRefresh }) {
  const navigate = useNavigate()

  const publishedQuizzes = quizzes.filter(q => q.status === 'published')
  const draftQuizzes = quizzes.filter(q => q.status !== 'published')

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Quizzes</h2>
        {isTeacher && (
          <button
            onClick={() => navigate(`/dashboard/course/${courseId}/quiz/create`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Quiz
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No quizzes yet</p>
          {isTeacher && (
            <button
              onClick={() => navigate(`/dashboard/course/${courseId}/quiz/create`)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create First Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {publishedQuizzes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Published</h3>
              <div className="space-y-3">
                {publishedQuizzes.map(quiz => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    courseId={courseId}
                    isTeacher={isTeacher}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            </div>
          )}

          {isTeacher && draftQuizzes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Drafts</h3>
              <div className="space-y-3">
                {draftQuizzes.map(quiz => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    courseId={courseId}
                    isTeacher={isTeacher}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
