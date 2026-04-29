import React, { useState, useEffect } from 'react'
import { Close } from '@mui/icons-material'

/**
 * EditAssignmentModal - Modal for editing assignments
 */
export default function EditAssignmentModal({ 
  isOpen, 
  assignment, 
  modules = [],
  onSave, 
  onCancel, 
  isLoading = false 
}) {
  const [form, setForm] = useState({
    title: '',
    instructions: '',
    due_at: '',
    status: 'draft',
    module_id: '',
  })

  useEffect(() => {
    if (assignment) {
      const dueDate = assignment.due_at ? new Date(assignment.due_at).toISOString().slice(0, 16) : ''
      setForm({
        title: assignment.title || '',
        instructions: assignment.instructions || '',
        due_at: dueDate,
        status: assignment.status || 'draft',
        module_id: assignment.module_id || '',
      })
    }
  }, [assignment, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Assignment title is required')
      return
    }
    onSave({
      id: assignment.id,
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      status: form.status,
      module_id: form.module_id || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg border border-token shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-main">Edit Assignment</h3>
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
              placeholder="Assignment title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Instructions</label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              disabled={isLoading}
              rows="3"
              className="w-full border border-token bg-surface rounded-lg px-3 py-2 text-main focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              placeholder="Assignment instructions"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Module</label>
            <select
              value={form.module_id}
              onChange={(e) => setForm({ ...form, module_id: e.target.value })}
              disabled={isLoading}
              className="w-full border border-token bg-surface rounded-lg px-3 py-2 text-main focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">No module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
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
