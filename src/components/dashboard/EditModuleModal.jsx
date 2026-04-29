import React, { useState, useEffect } from 'react'
import { Close } from '@mui/icons-material'

/**
 * EditModuleModal - Modal for editing course modules
 */
export default function EditModuleModal({ isOpen, module, onSave, onCancel, isLoading = false }) {
  const [form, setForm] = useState({ title: '', description: '' })

  useEffect(() => {
    if (module) {
      setForm({
        title: module.title || '',
        description: module.description || '',
      })
    }
  }, [module, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Module title is required')
      return
    }
    onSave({
      id: module.id,
      title: form.title.trim(),
      description: form.description.trim(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg border border-token shadow-lg max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-main">Edit Module</h3>
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
              placeholder="Module title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={isLoading}
              rows="4"
              className="w-full border border-token bg-surface rounded-lg px-3 py-2 text-main focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              placeholder="Module description (optional)"
            />
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
