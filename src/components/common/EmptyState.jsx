import React from 'react'

/**
 * Reusable EmptyState Component
 * Used to display empty states consistently across the application
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action = null,
  actionLabel = 'Create One',
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  }

  const iconSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  return (
    <div className={`text-center rounded-xl border border-slate-200 bg-slate-50 ${sizeClasses[size]}`}>
      {Icon && (
        <div className={`${iconSizeClasses[size]} bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className="text-slate-400" size={size === 'sm' ? 24 : size === 'md' ? 32 : 40} />
        </div>
      )}

      <h3 className={`font-semibold text-slate-900 ${size === 'sm' ? 'text-base' : 'text-lg'} mb-1`}>
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">{description}</p>
      )}

      {action && (
        <button
          onClick={action}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
