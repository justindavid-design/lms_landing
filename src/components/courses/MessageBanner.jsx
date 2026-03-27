import React from 'react'

export default function MessageBanner({ message, onClose }) {
  if (!message) return null

  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-token bg-surface-alt px-4 py-3 shadow-sm">
      <p className="text-sm text-main">{message}</p>
      <button onClick={onClose} className="text-xl leading-none text-muted hover:text-main">
        &times;
      </button>
    </div>
  )
}