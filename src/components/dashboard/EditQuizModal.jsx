import React, { useState, useEffect } from 'react'
import { Close } from '@mui/icons-material'

/**
 * EditQuizModal - Modal for editing quizzes
 */
export default function EditQuizModal({ 
  isOpen, 
  quiz, 
  onSave, 
  onCancel, 
  isLoading = false 
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_at: '',
    status: 'draft',
  })

  useEffect(() => {
    if (quiz) {
      const dueDate = quiz.due_at ? new Date(quiz.due_at).toISOString().slice(0, 16) : ''
      setForm({
        title: quiz.title || '',
        description: quiz.description || '',
        due_at: dueDate,
        status: quiz.status || 'draft',
      })
    }
  }, [quiz, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Quiz title is required')
      return
    }
    onSave({
      quiz_id: quiz.id,
      assignment_id: quiz.assignment_id,
      title: form.title.trim(),
      description: form.description.trim(),
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      status: form.status,
      instructions: form.description.trim(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg border border-token shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-main">Edit Quiz</h3>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-muted hover:text-main transition-colors"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-main mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={isLoading}
              className="w-full border border-token bg-surface rounded-lg px-3 py-2 text-main focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={isLoading}
              rows="3"
              className="w-full border border-token bg-surface rounded-lg px-3 py-2 text-main focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              placeholder="Quiz description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Due Date</label>
            <input
              type="datetime-local"
              value={form.due_at}
              onChange={(e) => setForm({ ...form, due_at: e.target.value })}
              disabled={isLoading}
              className="w-full border border-token bg-surface rounded-lg px-3 py-2 text-main focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={isLoading}
              className="w-full border border-token bg-surface rounded-lg px-3 py-2 text-main focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-token text-main hover:bg-surface-alt transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
