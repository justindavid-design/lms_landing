import React from 'react'

export default function MessageBanner({ message, onClose }) {
  if (!message) return null

  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-token bg-surface-alt px-4 py-3">
      <p className="text-sm leading-6 text-main">{message}</p>
      <button type="button" onClick={onClose} className="text-xl leading-none text-muted hover:text-main">
        &times;
      </button>
    </div>
  )
}
